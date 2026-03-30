using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class SimulacaoService : ISimulacaoService
{
    private readonly AppDbContext _db;
    private readonly ICompraService _compraService;

    public SimulacaoService(AppDbContext db, ICompraService compraService)
    {
        _db = db;
        _compraService = compraService;
    }

    public async Task<List<SimulacaoResumoResponse>> ListarAsync()
    {
        return await _db.Simulacoes
            .OrderByDescending(s => s.DataSimulacao)
            .Select(s => new SimulacaoResumoResponse
            {
                Id = s.Id,
                Nome = s.Nome,
                DataSimulacao = s.DataSimulacao,
                NumeroParcelas = s.NumeroParcelas,
                ValorTotal = s.ValorTotal
            })
            .ToListAsync();
    }

    public async Task<SimulacaoDetalheResponse?> ObterAsync(int id)
    {
        var simulacao = await _db.Simulacoes
            .Include(s => s.Parcelas)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (simulacao is null) return null;

        return MapToResponse(simulacao);
    }

    public async Task<SimulacaoDetalheResponse> CriarAsync(CriarSimulacaoRequest request)
    {
        var valorParcela = Math.Round(request.ValorTotal / request.NumeroParcelas, 2);
        var valorUltimaParcela = request.ValorTotal - (valorParcela * (request.NumeroParcelas - 1));

        var simulacao = new Simulacao
        {
            Nome = request.Nome,
            DataSimulacao = request.DataSimulacao,
            NumeroParcelas = request.NumeroParcelas,
            ValorTotal = request.ValorTotal
        };

        _db.Simulacoes.Add(simulacao);
        await _db.SaveChangesAsync();

        for (int i = 0; i < request.NumeroParcelas; i++)
        {
            var dataVencimento = request.DataSimulacao.AddMonths(i + 1);
            var valor = (i == request.NumeroParcelas - 1) ? valorUltimaParcela : valorParcela;

            var parcela = new SimulacaoParcela
            {
                SimulacaoId = simulacao.Id,
                NumeroParcela = i + 1,
                Valor = valor,
                DataVencimento = dataVencimento
            };

            _db.SimulacaoParcelas.Add(parcela);
        }

        await _db.SaveChangesAsync();

        // Reload with parcelas
        var result = await _db.Simulacoes
            .Include(s => s.Parcelas)
            .FirstAsync(s => s.Id == simulacao.Id);

        return MapToResponse(result);
    }

    public async Task<bool> DeletarAsync(int id)
    {
        var simulacao = await _db.Simulacoes.FindAsync(id);
        if (simulacao is null) return false;

        _db.Simulacoes.Remove(simulacao);
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Converte uma simulação em compra real.
    /// </summary>
    public async Task<CompraResponse?> ConverterEmCompraAsync(int simulacaoId)
    {
        var simulacao = await _db.Simulacoes.FindAsync(simulacaoId);
        if (simulacao is null) return null;

        var request = new CriarCompraRequest
        {
            Nome = simulacao.Nome ?? "Compra (simulação)",
            DataCompra = simulacao.DataSimulacao,
            NumeroParcelas = simulacao.NumeroParcelas,
            ValorTotal = simulacao.ValorTotal
        };

        var compra = await _compraService.CriarCompraAsync(request);

        // Remove a simulação após converter
        _db.Simulacoes.Remove(simulacao);
        await _db.SaveChangesAsync();

        return compra;
    }

    private static SimulacaoDetalheResponse MapToResponse(Simulacao simulacao)
    {
        return new SimulacaoDetalheResponse
        {
            Id = simulacao.Id,
            Nome = simulacao.Nome,
            DataSimulacao = simulacao.DataSimulacao,
            NumeroParcelas = simulacao.NumeroParcelas,
            ValorTotal = simulacao.ValorTotal,
            Parcelas = simulacao.Parcelas
                .OrderBy(p => p.NumeroParcela)
                .Select(p => new SimulacaoParcelaResponse
                {
                    Id = p.Id,
                    NumeroParcela = p.NumeroParcela,
                    Valor = p.Valor,
                    DataVencimento = p.DataVencimento,
                    Mes = p.DataVencimento.Month,
                    Ano = p.DataVencimento.Year
                }).ToList()
        };
    }
}
