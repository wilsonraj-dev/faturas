using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class LembretePagamentoService : ILembretePagamentoService
{
    private readonly AppDbContext _db;

    public LembretePagamentoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<LembretePagamentoResponse>> ListarAsync(int userId)
    {
        return await _db.LembretesPagamento
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.Ativo)
            .ThenBy(l => l.DiaVencimento)
            .ThenBy(l => l.NomeConta)
            .Select(l => new LembretePagamentoResponse
            {
                Id = l.Id,
                NomeConta = l.NomeConta,
                ValorConta = l.ValorConta,
                DiaVencimento = l.DiaVencimento,
                Ativo = l.Ativo,
                DataCriacao = l.DataCriacao
            })
            .ToListAsync();
    }

    public async Task<LembretePagamentoResponse> CriarAsync(CriarLembretePagamentoRequest request, int userId)
    {
        Validar(request.NomeConta, request.ValorConta, request.DiaVencimento);

        var lembrete = new LembretePagamento
        {
            UserId = userId,
            NomeConta = request.NomeConta.Trim(),
            ValorConta = request.ValorConta,
            DiaVencimento = request.DiaVencimento,
            Ativo = request.Ativo,
            DataCriacao = DateTime.UtcNow
        };

        _db.LembretesPagamento.Add(lembrete);
        await _db.SaveChangesAsync();

        return MapToResponse(lembrete);
    }

    public async Task<LembretePagamentoResponse?> AtualizarAsync(int id, AtualizarLembretePagamentoRequest request, int userId)
    {
        Validar(request.NomeConta, request.ValorConta, request.DiaVencimento);

        var lembrete = await _db.LembretesPagamento
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (lembrete is null)
        {
            return null;
        }

        lembrete.NomeConta = request.NomeConta.Trim();
        lembrete.ValorConta = request.ValorConta;
        lembrete.DiaVencimento = request.DiaVencimento;
        lembrete.Ativo = request.Ativo;

        await _db.SaveChangesAsync();
        return MapToResponse(lembrete);
    }

    public async Task<bool> ExcluirAsync(int id, int userId)
    {
        var lembrete = await _db.LembretesPagamento
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (lembrete is null)
        {
            return false;
        }

        _db.LembretesPagamento.Remove(lembrete);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AtivarAsync(int id, int userId)
    {
        var lembrete = await _db.LembretesPagamento
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (lembrete is null)
        {
            return false;
        }

        if (lembrete.Ativo)
        {
            return true;
        }

        lembrete.Ativo = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DesativarAsync(int id, int userId)
    {
        var lembrete = await _db.LembretesPagamento
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (lembrete is null)
        {
            return false;
        }

        if (!lembrete.Ativo)
        {
            return true;
        }

        lembrete.Ativo = false;
        await _db.SaveChangesAsync();
        return true;
    }

    private static void Validar(string nomeConta, decimal valorConta, int diaVencimento)
    {
        if (string.IsNullOrWhiteSpace(nomeConta))
        {
            throw new ArgumentException("O nome da conta é obrigatório.");
        }

        if (valorConta <= 0)
        {
            throw new ArgumentException("O valor da conta deve ser maior que zero.");
        }

        if (diaVencimento < 1 || diaVencimento > 31)
        {
            throw new ArgumentException("O dia de vencimento deve estar entre 1 e 31.");
        }
    }

    private static LembretePagamentoResponse MapToResponse(LembretePagamento lembrete)
    {
        return new LembretePagamentoResponse
        {
            Id = lembrete.Id,
            NomeConta = lembrete.NomeConta,
            ValorConta = lembrete.ValorConta,
            DiaVencimento = lembrete.DiaVencimento,
            Ativo = lembrete.Ativo,
            DataCriacao = lembrete.DataCriacao
        };
    }
}