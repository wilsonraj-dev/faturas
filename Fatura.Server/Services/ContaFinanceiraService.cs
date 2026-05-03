using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class ContaFinanceiraService : IContaFinanceiraService
{
    private readonly AppDbContext _db;

    public ContaFinanceiraService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ContaFinanceiraResponse>> ListarAsync(int userId, int? instituicaoId)
    {
        var query = _db.ContasFinanceiras
            .AsNoTracking()
            .Where(c => c.UserId == userId);

        if (instituicaoId.HasValue)
        {
            query = query.Where(c => c.InstituicaoId == instituicaoId.Value);
        }

        return await query
            .OrderBy(c => c.Nome)
            .Select(c => new ContaFinanceiraResponse
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.Tipo,
                InstituicaoId = c.InstituicaoId,
                InstituicaoNome = c.Instituicao.Nome
            })
            .ToListAsync();
    }

    public async Task<ContaFinanceiraResponse?> ObterAsync(int id, int userId)
    {
        return await _db.ContasFinanceiras
            .AsNoTracking()
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(c => new ContaFinanceiraResponse
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.Tipo,
                InstituicaoId = c.InstituicaoId,
                InstituicaoNome = c.Instituicao.Nome
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceResult<ContaFinanceiraResponse>> CriarAsync(CriarContaFinanceiraRequest request, int userId)
    {
        var validacao = await ValidarRequestAsync(request.Nome, request.InstituicaoId, request.Tipo, userId);
        if (validacao is not null)
        {
            return ServiceResult<ContaFinanceiraResponse>.Invalid(validacao);
        }

        var conta = new ContaFinanceira
        {
            Nome = request.Nome.Trim(),
            Tipo = request.Tipo,
            InstituicaoId = request.InstituicaoId,
            UserId = userId
        };

        _db.ContasFinanceiras.Add(conta);
        await _db.SaveChangesAsync();

        var instituicaoNome = await _db.InstituicoesFinanceiras
            .Where(i => i.Id == request.InstituicaoId)
            .Select(i => i.Nome)
            .FirstAsync();

        return ServiceResult<ContaFinanceiraResponse>.Ok(new ContaFinanceiraResponse
        {
            Id = conta.Id,
            Nome = conta.Nome,
            Tipo = conta.Tipo,
            InstituicaoId = conta.InstituicaoId,
            InstituicaoNome = instituicaoNome
        });
    }

    public async Task<ServiceResult<ContaFinanceiraResponse>> AtualizarAsync(int id, AtualizarContaFinanceiraRequest request, int userId)
    {
        var conta = await _db.ContasFinanceiras
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (conta is null)
        {
            return ServiceResult<ContaFinanceiraResponse>.NotFoundResult("Conta financeira não encontrada.");
        }

        var validacao = await ValidarRequestAsync(request.Nome, request.InstituicaoId, request.Tipo, userId, id);
        if (validacao is not null)
        {
            return ServiceResult<ContaFinanceiraResponse>.Invalid(validacao);
        }

        conta.Nome = request.Nome.Trim();
        conta.Tipo = request.Tipo;
        conta.InstituicaoId = request.InstituicaoId;
        await _db.SaveChangesAsync();

        var instituicaoNome = await _db.InstituicoesFinanceiras
            .Where(i => i.Id == request.InstituicaoId)
            .Select(i => i.Nome)
            .FirstAsync();

        return ServiceResult<ContaFinanceiraResponse>.Ok(new ContaFinanceiraResponse
        {
            Id = conta.Id,
            Nome = conta.Nome,
            Tipo = conta.Tipo,
            InstituicaoId = conta.InstituicaoId,
            InstituicaoNome = instituicaoNome
        });
    }

    public async Task<ServiceResult> DeletarAsync(int id, int userId)
    {
        var conta = await _db.ContasFinanceiras
            .Include(c => c.Lancamentos)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (conta is null)
        {
            return ServiceResult.NotFoundResult("Conta financeira não encontrada.");
        }

        if (conta.Lancamentos.Count > 0)
        {
            return ServiceResult.Invalid("Não é possível excluir uma conta com lançamentos vinculados.");
        }

        _db.ContasFinanceiras.Remove(conta);
        await _db.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    private async Task<string?> ValidarRequestAsync(string nome, int instituicaoId, TipoContaFinanceira tipo, int userId, int? contaId = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            return "O nome da conta financeira é obrigatório.";
        }

        if (!Enum.IsDefined(tipo))
        {
            return "O tipo da conta financeira é inválido.";
        }

        var instituicaoExiste = await _db.InstituicoesFinanceiras
            .AnyAsync(i => i.Id == instituicaoId && i.UserId == userId);

        if (!instituicaoExiste)
        {
            return "A instituição financeira informada não foi encontrada.";
        }

        var nomeNormalizado = nome.Trim();
        var contaExiste = await _db.ContasFinanceiras
            .AnyAsync(c => c.UserId == userId
                && c.InstituicaoId == instituicaoId
                && c.Nome == nomeNormalizado
                && (!contaId.HasValue || c.Id != contaId.Value));

        if (contaExiste)
        {
            return "Já existe uma conta com esse nome para a instituição informada.";
        }

        return null;
    }
}