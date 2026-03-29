using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class FaturaService : IFaturaService
{
    private readonly AppDbContext _db;

    public FaturaService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Lista todas as faturas de um determinado ano, ordenadas por mês.
    /// </summary>
    public async Task<List<FaturaResumoResponse>> ListarFaturasAsync(int ano)
    {
        return await _db.Faturas
            .Where(f => f.Ano == ano)
            .OrderBy(f => f.Mes)
            .Select(f => new FaturaResumoResponse
            {
                Id = f.Id,
                Mes = f.Mes,
                Ano = f.Ano,
                ValorTotal = f.ValorTotal,
                Quitada = f.Quitada,
                QuantidadeParcelas = f.Parcelas.Count,
                Orcamento = f.Orcamento
            })
            .ToListAsync();
    }

    /// <summary>
    /// Obtém os detalhes de uma fatura com todas as suas parcelas.
    /// </summary>
    public async Task<FaturaDetalheResponse?> ObterFaturaAsync(int id)
    {
        var fatura = await _db.Faturas
            .Include(f => f.Parcelas)
                .ThenInclude(p => p.Compra)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (fatura is null) return null;

        return new FaturaDetalheResponse
        {
            Id = fatura.Id,
            Mes = fatura.Mes,
            Ano = fatura.Ano,
            ValorTotal = fatura.ValorTotal,
            Quitada = fatura.Quitada,
            Orcamento = fatura.Orcamento,
            Parcelas = fatura.Parcelas
                .OrderBy(p => p.Compra.Nome)
                .ThenBy(p => p.NumeroParcela)
                .Select(p => new ParcelaResponse
                {
                    Id = p.Id,
                    NomeCompra = p.Compra.Nome,
                    NumeroParcela = p.NumeroParcela,
                    TotalParcelas = p.Compra.NumeroParcelas,
                    Valor = p.Valor,
                    DataVencimento = p.DataVencimento
                }).ToList()
        };
    }

    /// <summary>
    /// Marca uma fatura como quitada.
    /// </summary>
    public async Task<bool> QuitarFaturaAsync(int id)
    {
        var fatura = await _db.Faturas.FindAsync(id);
        if (fatura is null) return false;

        fatura.Quitada = true;
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Reabre uma fatura previamente quitada.
    /// </summary>
    public async Task<bool> ReabrirFaturaAsync(int id)
    {
        var fatura = await _db.Faturas.FindAsync(id);
        if (fatura is null) return false;

        fatura.Quitada = false;
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Atualiza o orçamento de uma fatura.
    /// </summary>
    public async Task<bool> AtualizarOrcamentoAsync(int id, double orcamento)
    {
        var fatura = await _db.Faturas.FindAsync(id);
        if (fatura is null) return false;

        fatura.Orcamento = orcamento;
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Retorna dados para o dashboard: faturas do ano com totais.
    /// </summary>
    public async Task<List<FaturaResumoResponse>> ObterDashboardAsync(int ano)
    {
        return await ListarFaturasAsync(ano);
    }
}
