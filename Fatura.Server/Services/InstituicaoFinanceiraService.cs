using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class InstituicaoFinanceiraService : IInstituicaoFinanceiraService
{
    private readonly AppDbContext _db;

    public InstituicaoFinanceiraService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<InstituicaoFinanceiraResponse>> ListarAsync(int userId)
    {
        return await _db.InstituicoesFinanceiras
            .AsNoTracking()
            .Where(i => i.UserId == userId)
            .OrderBy(i => i.Nome)
            .Select(i => new InstituicaoFinanceiraResponse
            {
                Id = i.Id,
                Nome = i.Nome,
                QuantidadeContas = i.Contas.Count
            })
            .ToListAsync();
    }

    public async Task<InstituicaoFinanceiraDetalheResponse?> ObterAsync(int id, int userId)
    {
        return await _db.InstituicoesFinanceiras
            .AsNoTracking()
            .Where(i => i.Id == id && i.UserId == userId)
            .Select(i => new InstituicaoFinanceiraDetalheResponse
            {
                Id = i.Id,
                Nome = i.Nome,
                Contas = i.Contas
                    .OrderBy(c => c.Nome)
                    .Select(c => new ContaFinanceiraResumoResponse
                    {
                        Id = c.Id,
                        Nome = c.Nome,
                        Tipo = c.Tipo
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceResult<InstituicaoFinanceiraResponse>> CriarAsync(CriarInstituicaoFinanceiraRequest request, int userId)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            return ServiceResult<InstituicaoFinanceiraResponse>.Invalid("O nome da instituição financeira é obrigatório.");
        }

        var nome = request.Nome.Trim();
        var existe = await _db.InstituicoesFinanceiras
            .AnyAsync(i => i.UserId == userId && i.Nome == nome);

        if (existe)
        {
            return ServiceResult<InstituicaoFinanceiraResponse>.Invalid("Já existe uma instituição financeira com esse nome.");
        }

        var instituicao = new InstituicaoFinanceira
        {
            Nome = nome,
            UserId = userId
        };

        _db.InstituicoesFinanceiras.Add(instituicao);
        await _db.SaveChangesAsync();

        return ServiceResult<InstituicaoFinanceiraResponse>.Ok(new InstituicaoFinanceiraResponse
        {
            Id = instituicao.Id,
            Nome = instituicao.Nome,
            QuantidadeContas = 0
        });
    }

    public async Task<ServiceResult<InstituicaoFinanceiraResponse>> AtualizarAsync(int id, AtualizarInstituicaoFinanceiraRequest request, int userId)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
        {
            return ServiceResult<InstituicaoFinanceiraResponse>.Invalid("O nome da instituição financeira é obrigatório.");
        }

        var instituicao = await _db.InstituicoesFinanceiras
            .Include(i => i.Contas)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (instituicao is null)
        {
            return ServiceResult<InstituicaoFinanceiraResponse>.NotFoundResult("Instituição financeira não encontrada.");
        }

        var nome = request.Nome.Trim();
        var existe = await _db.InstituicoesFinanceiras
            .AnyAsync(i => i.UserId == userId && i.Id != id && i.Nome == nome);

        if (existe)
        {
            return ServiceResult<InstituicaoFinanceiraResponse>.Invalid("Já existe uma instituição financeira com esse nome.");
        }

        instituicao.Nome = nome;
        await _db.SaveChangesAsync();

        return ServiceResult<InstituicaoFinanceiraResponse>.Ok(new InstituicaoFinanceiraResponse
        {
            Id = instituicao.Id,
            Nome = instituicao.Nome,
            QuantidadeContas = instituicao.Contas.Count
        });
    }

    public async Task<ServiceResult> DeletarAsync(int id, int userId)
    {
        var instituicao = await _db.InstituicoesFinanceiras
            .Include(i => i.Contas)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (instituicao is null)
        {
            return ServiceResult.NotFoundResult("Instituição financeira não encontrada.");
        }

        if (instituicao.Contas.Count > 0)
        {
            return ServiceResult.Invalid("Não é possível excluir uma instituição com contas vinculadas.");
        }

        _db.InstituicoesFinanceiras.Remove(instituicao);
        await _db.SaveChangesAsync();
        return ServiceResult.Ok();
    }
}