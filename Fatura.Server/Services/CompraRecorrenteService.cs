using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class CompraRecorrenteService : ICompraRecorrenteService
{
    private readonly AppDbContext _db;

    public CompraRecorrenteService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CompraRecorrenteResponse>> ListarAsync(int userId)
    {
        return await _db.ComprasRecorrentes
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.Ativo)
            .ThenBy(c => c.DiaCobranca)
            .ThenBy(c => c.Nome)
            .Select(c => new CompraRecorrenteResponse
            {
                Id = c.Id,
                Nome = c.Nome,
                ValorMensal = c.ValorMensal,
                DiaCobranca = c.DiaCobranca,
                Ativo = c.Ativo
            })
            .ToListAsync();
    }

    public async Task<CompraRecorrenteResponse> CriarAsync(CriarCompraRecorrenteRequest request, int userId)
    {
        var compraRecorrente = new CompraRecorrente
        {
            Nome = request.Nome,
            ValorMensal = request.ValorMensal,
            DiaCobranca = request.DiaCobranca,
            Ativo = request.Ativo,
            UserId = userId
        };

        _db.ComprasRecorrentes.Add(compraRecorrente);
        await _db.SaveChangesAsync();

        if (compraRecorrente.Ativo)
        {
            await SincronizarComprasRecorrentesAsync(userId);
        }

        return MapToResponse(compraRecorrente);
    }

    public async Task<CompraRecorrenteResponse?> AtualizarAsync(int id, AtualizarCompraRecorrenteRequest request, int userId)
    {
        var compraRecorrente = await _db.ComprasRecorrentes
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (compraRecorrente is null)
        {
            return null;
        }

        compraRecorrente.Nome = request.Nome;
        compraRecorrente.ValorMensal = request.ValorMensal;
        compraRecorrente.DiaCobranca = request.DiaCobranca;
        compraRecorrente.Ativo = request.Ativo;

        await _db.SaveChangesAsync();

        if (compraRecorrente.Ativo)
        {
            await SincronizarComprasRecorrentesAsync(userId);
        }

        return MapToResponse(compraRecorrente);
    }

    public async Task<bool> DesativarAsync(int id, int userId)
    {
        var compraRecorrente = await _db.ComprasRecorrentes
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (compraRecorrente is null)
        {
            return false;
        }

        if (!compraRecorrente.Ativo)
        {
            return true;
        }

        compraRecorrente.Ativo = false;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task SincronizarComprasRecorrentesAsync(int userId)
    {
        var hoje = DateTime.Today;
        var comprasAtivas = await _db.ComprasRecorrentes
            .Where(c => c.UserId == userId && c.Ativo)
            .ToListAsync();

        if (comprasAtivas.Count == 0)
        {
            return;
        }

        var faturasAfetadas = new HashSet<int>();
        var houveInclusao = false;

        foreach (var compraRecorrente in comprasAtivas)
        {
            var referencia = hoje.Day >= compraRecorrente.DiaCobranca
                ? hoje.AddMonths(1)
                : hoje;

            var mes = referencia.Month;
            var ano = referencia.Year;

            var jaExiste = await _db.Parcelas.AnyAsync(p =>
                p.UserId == userId &&
                p.CompraRecorrenteId == compraRecorrente.Id &&
                p.Fatura != null &&
                p.Fatura.Mes == mes &&
                p.Fatura.Ano == ano);

            if (jaExiste)
            {
                continue;
            }

            var fatura = await ObterOuCriarFaturaAsync(mes, ano, userId);
            var diaVencimento = Math.Min(compraRecorrente.DiaCobranca, DateTime.DaysInMonth(ano, mes));

            _db.Parcelas.Add(new Parcela
            {
                CompraId = null,
                Tipo = ParcelaTipo.Recorrente,
                CompraRecorrenteId = compraRecorrente.Id,
                NumeroParcela = 1,
                Valor = compraRecorrente.ValorMensal,
                DataVencimento = new DateTime(ano, mes, diaVencimento),
                FaturaId = fatura.Id,
                UserId = userId
            });

            houveInclusao = true;
            faturasAfetadas.Add(fatura.Id);
        }

        if (!houveInclusao)
        {
            return;
        }

        await _db.SaveChangesAsync();
        await RecalcularFaturasAsync(faturasAfetadas);
    }

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

    private async Task RecalcularFaturasAsync(IEnumerable<int> faturaIds)
    {
        foreach (var faturaId in faturaIds.Distinct())
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

    private static CompraRecorrenteResponse MapToResponse(CompraRecorrente compraRecorrente)
    {
        return new CompraRecorrenteResponse
        {
            Id = compraRecorrente.Id,
            Nome = compraRecorrente.Nome,
            ValorMensal = compraRecorrente.ValorMensal,
            DiaCobranca = compraRecorrente.DiaCobranca,
            Ativo = compraRecorrente.Ativo
        };
    }
}
