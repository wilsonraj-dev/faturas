using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Fatura.Server.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fatura.Server.Tests;

public class CompraServiceTests
{
    [Fact]
    public async Task EdicaoRecriaParcelasERecalculaFaturasAntigasENovas()
    {
        await using var fixture = await CompraFixture.CreateAsync();
        var outra = await fixture.Service.CriarCompraAsync(fixture.Request("Outra", new DateTime(2026, 1, 10), 1, 30m), fixture.UserId);
        var compra = await fixture.Service.CriarCompraAsync(fixture.Request("Original", new DateTime(2026, 1, 10), 2, 100m), fixture.UserId);

        var resultado = await fixture.Service.AtualizarCompraAsync(compra.Id,
            fixture.Request("Alterada", new DateTime(2026, 3, 10), 1, 75m), fixture.UserId);

        Assert.True(resultado.Success);
        Assert.Equal("Alterada", resultado.Data!.Nome);
        Assert.Single(resultado.Data.Parcelas);
        Assert.Equal(new DateTime(2026, 4, 10), resultado.Data.Parcelas[0].DataVencimento);
        Assert.Equal(30m, await fixture.TotalAsync(2026, 2));
        Assert.Equal(0m, await fixture.TotalAsync(2026, 3));
        Assert.Equal(75m, await fixture.TotalAsync(2026, 4));
        Assert.NotNull(await fixture.Service.ObterCompraAsync(outra.Id, fixture.UserId));
    }

    [Fact]
    public async Task RemocaoExcluiParcelasELancamentosVinculadosERecalculaTotal()
    {
        await using var fixture = await CompraFixture.CreateAsync();
        var compra = await fixture.Service.CriarCompraAsync(fixture.Request("Compra", new DateTime(2026, 1, 10), 1, 50m), fixture.UserId);
        var parcelaId = compra.Parcelas[0].Id;
        fixture.Db.LancamentosFinanceiros.Add(new LancamentoFinanceiro
        {
            Tipo = TipoCategoria.Despesa, Valor = 50m, Data = new DateTime(2026, 2, 10),
            ContaFinanceiraId = fixture.ContaId, Origem = OrigemLancamento.Fatura,
            OrigemId = parcelaId, UserId = fixture.UserId
        });
        await fixture.Db.SaveChangesAsync();

        var resultado = await fixture.Service.RemoverCompraAsync(compra.Id, fixture.UserId);

        Assert.True(resultado.Success);
        Assert.Null(await fixture.Service.ObterCompraAsync(compra.Id, fixture.UserId));
        Assert.False(await fixture.Db.Parcelas.AnyAsync(p => p.CompraId == compra.Id));
        Assert.False(await fixture.Db.LancamentosFinanceiros.AnyAsync(l => l.OrigemId == parcelaId));
        Assert.Equal(0m, await fixture.TotalAsync(2026, 2));
    }

    [Fact]
    public async Task FaturaQuitadaEmQualquerParcelaBloqueiaEdicaoERemocao()
    {
        await using var fixture = await CompraFixture.CreateAsync();
        var compra = await fixture.Service.CriarCompraAsync(fixture.Request("Compra", new DateTime(2026, 1, 10), 2, 100m), fixture.UserId);
        var faturaMarco = await fixture.Db.Faturas.SingleAsync(f => f.Ano == 2026 && f.Mes == 3);
        faturaMarco.Quitada = true;
        await fixture.Db.SaveChangesAsync();

        var edicao = await fixture.Service.AtualizarCompraAsync(compra.Id,
            fixture.Request("Alterada", new DateTime(2026, 4, 10), 1, 20m), fixture.UserId);
        var remocao = await fixture.Service.RemoverCompraAsync(compra.Id, fixture.UserId);

        Assert.False(edicao.Success);
        Assert.False(remocao.Success);
        Assert.Equal(2, await fixture.Db.Parcelas.CountAsync(p => p.CompraId == compra.Id));
        Assert.Equal(50m, await fixture.TotalAsync(2026, 2));
        Assert.Equal(50m, await fixture.TotalAsync(2026, 3));
    }

    [Fact]
    public async Task EdicaoNaoMoveParcelaParaFaturaQuitada()
    {
        await using var fixture = await CompraFixture.CreateAsync();
        var compra = await fixture.Service.CriarCompraAsync(fixture.Request("Compra", new DateTime(2026, 1, 10), 1, 50m), fixture.UserId);
        fixture.Db.Faturas.Add(new FaturaEntity
        {
            Ano = 2026, Mes = 4, UserId = fixture.UserId, Quitada = true
        });
        await fixture.Db.SaveChangesAsync();

        var resultado = await fixture.Service.AtualizarCompraAsync(compra.Id,
            fixture.Request("Alterada", new DateTime(2026, 3, 10), 1, 70m), fixture.UserId);

        Assert.False(resultado.Success);
        Assert.Equal("Compra", (await fixture.Service.ObterCompraAsync(compra.Id, fixture.UserId))!.Nome);
        Assert.Equal(50m, await fixture.TotalAsync(2026, 2));
        Assert.Equal(0m, await fixture.TotalAsync(2026, 4));
    }

    private sealed class CompraFixture : IAsyncDisposable
    {
        private readonly SqliteConnection _connection;
        public AppDbContext Db { get; }
        public CompraService Service { get; }
        public int UserId { get; private set; }
        public int ContaId { get; private set; }

        private CompraFixture(SqliteConnection connection, AppDbContext db)
        {
            _connection = connection;
            Db = db;
            Service = new CompraService(db);
        }

        public static async Task<CompraFixture> CreateAsync()
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
            await db.Database.EnsureCreatedAsync();
            var user = new User { Nome = "Teste", Email = "teste@example.com", PasswordHash = "hash" };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            var instituicao = new InstituicaoFinanceira { Nome = "Banco", UserId = user.Id };
            db.InstituicoesFinanceiras.Add(instituicao);
            await db.SaveChangesAsync();
            var conta = new ContaFinanceira { Nome = "Cartão", InstituicaoId = instituicao.Id, UserId = user.Id };
            db.ContasFinanceiras.Add(conta);
            await db.SaveChangesAsync();
            return new CompraFixture(connection, db) { UserId = user.Id, ContaId = conta.Id };
        }

        public CriarCompraRequest Request(string nome, DateTime data, int parcelas, decimal valor) => new()
        {
            Nome = nome, DataCompra = data, NumeroParcelas = parcelas,
            ValorTotal = valor, ContaFinanceiraId = ContaId
        };

        public async Task<decimal> TotalAsync(int ano, int mes) =>
            (await Db.Faturas.SingleAsync(f => f.Ano == ano && f.Mes == mes)).ValorTotal;

        public async ValueTask DisposeAsync()
        {
            await Db.DisposeAsync();
            await _connection.DisposeAsync();
        }
    }
}
