using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class CompraService : ICompraService
{
    private readonly AppDbContext _db;

    public CompraService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Cria uma compra e gera automaticamente as parcelas,
    /// vinculando cada uma à fatura correspondente (mês/ano).
    /// </summary>
    public async Task<CompraResponse> CriarCompraAsync(CriarCompraRequest request, int userId)
    {
        // Calcula o valor de cada parcela (divisão igualitária)
        var valorParcela = Math.Round(request.ValorTotal / request.NumeroParcelas, 2);

        // Ajusta a última parcela para compensar diferenças de arredondamento
        var valorUltimaParcela = request.ValorTotal - (valorParcela * (request.NumeroParcelas - 1));

        var compra = new Compra
        {
            Nome = request.Nome,
            DataCompra = request.DataCompra,
            NumeroParcelas = request.NumeroParcelas,
            ValorTotal = request.ValorTotal,
            FornecedorId = request.FornecedorId,
            UserId = userId
        };

        _db.Compras.Add(compra);
        await _db.SaveChangesAsync();

        // Gera as parcelas mês a mês a partir do mês seguinte à data da compra
        for (int i = 0; i < request.NumeroParcelas; i++)
        {
            var dataVencimento = request.DataCompra.AddMonths(i + 1);
            var valor = (i == request.NumeroParcelas - 1) ? valorUltimaParcela : valorParcela;

            // Busca ou cria a fatura do mês/ano correspondente
            var fatura = await ObterOuCriarFaturaAsync(dataVencimento.Month, dataVencimento.Year, userId);

            var parcela = new Parcela
            {
                CompraId = compra.Id,
                NumeroParcela = i + 1,
                Valor = valor,
                DataVencimento = dataVencimento,
                FaturaId = fatura.Id,
                UserId = userId
            };

            _db.Parcelas.Add(parcela);
        }

        await _db.SaveChangesAsync();

        // Recalcula o valor total de cada fatura afetada
        await RecalcularFaturasAsync(compra.Id);

        // Retorna a compra com suas parcelas
        var parcelas = await _db.Parcelas
            .Where(p => p.CompraId == compra.Id)
            .OrderBy(p => p.NumeroParcela)
            .ToListAsync();

        // Carrega fornecedor se existir
        string? fornecedorNome = null;
        if (compra.FornecedorId.HasValue)
        {
            var fornecedor = await _db.Fornecedores.FindAsync(compra.FornecedorId.Value);
            fornecedorNome = fornecedor?.Nome;
        }

        return new CompraResponse
        {
            Id = compra.Id,
            Nome = compra.Nome,
            DataCompra = compra.DataCompra,
            NumeroParcelas = compra.NumeroParcelas,
            ValorTotal = compra.ValorTotal,
            FornecedorId = compra.FornecedorId,
            FornecedorNome = fornecedorNome,
            Parcelas = parcelas.Select(p => new ParcelaResponse
            {
                Id = p.Id,
                NomeCompra = compra.Nome,
                NumeroParcela = p.NumeroParcela,
                TotalParcelas = compra.NumeroParcelas,
                Valor = p.Valor,
                DataVencimento = p.DataVencimento,
                FornecedorNome = fornecedorNome
            }).ToList()
        };
    }

    /// <summary>
    /// Simula a distribuição de parcelas nas faturas sem persistir no banco.
    /// </summary>
    public Task<SimulacaoResponse> SimularCompraAsync(CriarCompraRequest request)
    {
        var valorParcela = Math.Round(request.ValorTotal / request.NumeroParcelas, 2);
        var valorUltimaParcela = request.ValorTotal - (valorParcela * (request.NumeroParcelas - 1));

        var faturas = new List<SimulacaoFaturaItem>();

        for (int i = 0; i < request.NumeroParcelas; i++)
        {
            var data = request.DataCompra.AddMonths(i + 1);
            faturas.Add(new SimulacaoFaturaItem
            {
                Mes = data.Month,
                Ano = data.Year,
                ValorParcela = (i == request.NumeroParcelas - 1) ? valorUltimaParcela : valorParcela
            });
        }

        return Task.FromResult(new SimulacaoResponse { Faturas = faturas });
    }

    /// <summary>
    /// Busca uma fatura existente para o mês/ano ou cria uma nova.
    /// </summary>
    private async Task<FaturaEntity> ObterOuCriarFaturaAsync(int mes, int ano, int userId)
    {
        var fatura = await _db.Faturas.FirstOrDefaultAsync(f => f.Mes == mes && f.Ano == ano && f.UserId == userId);

        if (fatura is null)
        {
            fatura = new FaturaEntity
            {
                Mes = mes,
                Ano = ano,
                ValorTotal = 0,
                Quitada = false,
                UserId = userId
            };
            _db.Faturas.Add(fatura);
            await _db.SaveChangesAsync();
        }

        return fatura;
    }

    /// <summary>
    /// Recalcula o valor total de todas as faturas vinculadas a uma compra.
    /// </summary>
    private async Task RecalcularFaturasAsync(int compraId)
    {
        var faturaIds = await _db.Parcelas
            .Where(p => p.CompraId == compraId && p.FaturaId != null)
            .Select(p => p.FaturaId!.Value)
            .Distinct()
            .ToListAsync();

        foreach (var faturaId in faturaIds)
        {
            var total = await _db.Parcelas
                .Where(p => p.FaturaId == faturaId)
                .SumAsync(p => p.Valor);

            var fatura = await _db.Faturas.FindAsync(faturaId);
            if (fatura is not null)
            {
                fatura.ValorTotal = total;
            }
        }

        await _db.SaveChangesAsync();
    }
}
