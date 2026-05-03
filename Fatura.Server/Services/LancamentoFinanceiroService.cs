using System.Linq.Expressions;
using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class LancamentoFinanceiroService : ILancamentoFinanceiroService
{
    private readonly AppDbContext _db;

    public LancamentoFinanceiroService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<LancamentoFinanceiroResponse>> ListarAsync(int userId, DateTime? dataInicial, DateTime? dataFinal, TipoCategoria? tipo)
    {
        var query = _db.LancamentosFinanceiros
            .AsNoTracking()
            .Where(l => l.UserId == userId);

        if (dataInicial.HasValue)
        {
            var inicio = dataInicial.Value.Date;
            query = query.Where(l => l.Data >= inicio);
        }

        if (dataFinal.HasValue)
        {
            var fim = dataFinal.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(l => l.Data <= fim);
        }

        if (tipo.HasValue)
        {
            query = query.Where(l => l.Tipo == tipo.Value);
        }

        return await query
            .OrderByDescending(l => l.Data)
            .ThenByDescending(l => l.Id)
            .Select(MapearResponse())
            .ToListAsync();
    }

    public async Task<LancamentoFinanceiroResponse?> ObterAsync(int id, int userId)
    {
        return await _db.LancamentosFinanceiros
            .AsNoTracking()
            .Where(l => l.Id == id && l.UserId == userId)
            .Select(MapearResponse())
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceResult<LancamentoFinanceiroResponse>> CriarAsync(CriarLancamentoFinanceiroRequest request, int userId)
    {
        var validacao = await ValidarCriacaoAsync(request, userId);
        if (validacao is not null)
        {
            return ServiceResult<LancamentoFinanceiroResponse>.Invalid(validacao);
        }

        var lancamento = new LancamentoFinanceiro
        {
            Tipo = request.Tipo,
            Valor = request.Valor,
            Data = request.Data,
            Descricao = request.Descricao?.Trim(),
            CategoriaId = request.CategoriaId,
            SubcategoriaId = request.SubcategoriaId,
            ContaFinanceiraId = request.ContaFinanceiraId,
            Origem = request.Origem,
            OrigemId = request.OrigemId,
            UserId = userId
        };

        _db.LancamentosFinanceiros.Add(lancamento);
        await _db.SaveChangesAsync();

        var response = await _db.LancamentosFinanceiros
            .AsNoTracking()
            .Where(l => l.Id == lancamento.Id)
            .Select(MapearResponse())
            .FirstAsync();

        return ServiceResult<LancamentoFinanceiroResponse>.Ok(response);
    }

    public async Task<ServiceResult<LancamentoFinanceiroResponse>> AtualizarAsync(int id, AtualizarLancamentoFinanceiroRequest request, int userId)
    {
        var lancamento = await _db.LancamentosFinanceiros
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (lancamento is null)
        {
            return ServiceResult<LancamentoFinanceiroResponse>.NotFoundResult("Lançamento financeiro não encontrado.");
        }

        var validacao = await ValidarAtualizacaoAsync(request, userId);
        if (validacao is not null)
        {
            return ServiceResult<LancamentoFinanceiroResponse>.Invalid(validacao);
        }

        lancamento.Tipo = request.Tipo;
        lancamento.Valor = request.Valor;
        lancamento.Data = request.Data;
        lancamento.Descricao = request.Descricao?.Trim();
        lancamento.CategoriaId = request.CategoriaId;
        lancamento.SubcategoriaId = request.SubcategoriaId;
        lancamento.ContaFinanceiraId = request.ContaFinanceiraId;

        await _db.SaveChangesAsync();

        var response = await _db.LancamentosFinanceiros
            .AsNoTracking()
            .Where(l => l.Id == id)
            .Select(MapearResponse())
            .FirstAsync();

        return ServiceResult<LancamentoFinanceiroResponse>.Ok(response);
    }

    public async Task<ServiceResult> DeletarAsync(int id, int userId)
    {
        var lancamento = await _db.LancamentosFinanceiros
            .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

        if (lancamento is null)
        {
            return ServiceResult.NotFoundResult("Lançamento financeiro não encontrado.");
        }

        _db.LancamentosFinanceiros.Remove(lancamento);
        await _db.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    private async Task<string?> ValidarCriacaoAsync(CriarLancamentoFinanceiroRequest request, int userId)
    {
        if (!Enum.IsDefined(request.Tipo))
        {
            return "O tipo do lançamento é inválido.";
        }

        if (!Enum.IsDefined(request.Origem))
        {
            return "A origem do lançamento é inválida.";
        }

        if (request.Valor <= 0)
        {
            return "O valor do lançamento deve ser maior que zero.";
        }

        if (request.Data == default)
        {
            return "A data do lançamento é obrigatória.";
        }

        if (request.Origem != OrigemLancamento.Manual && !request.OrigemId.HasValue)
        {
            return "OrigemId é obrigatório para lançamentos não manuais.";
        }

        if (request.OrigemId.HasValue)
        {
            var origemDuplicada = await _db.LancamentosFinanceiros
                .AnyAsync(l => l.Origem == request.Origem && l.OrigemId == request.OrigemId.Value);

            if (origemDuplicada)
            {
                return "Já existe um lançamento para a origem informada.";
            }
        }

        return await ValidarRelacionamentosAsync(
            request.CategoriaId,
            request.SubcategoriaId,
            request.ContaFinanceiraId,
            request.Tipo,
            userId);
    }

    private async Task<string?> ValidarAtualizacaoAsync(AtualizarLancamentoFinanceiroRequest request, int userId)
    {
        if (!Enum.IsDefined(request.Tipo))
        {
            return "O tipo do lançamento é inválido.";
        }

        if (request.Valor <= 0)
        {
            return "O valor do lançamento deve ser maior que zero.";
        }

        if (request.Data == default)
        {
            return "A data do lançamento é obrigatória.";
        }

        return await ValidarRelacionamentosAsync(
            request.CategoriaId,
            request.SubcategoriaId,
            request.ContaFinanceiraId,
            request.Tipo,
            userId);
    }

    private async Task<string?> ValidarRelacionamentosAsync(int? categoriaId, int? subcategoriaId, int contaFinanceiraId, TipoCategoria tipo, int userId)
    {
        var contaExiste = await _db.ContasFinanceiras
            .AnyAsync(c => c.Id == contaFinanceiraId && c.UserId == userId);

        if (!contaExiste)
        {
            return "A conta financeira informada não foi encontrada.";
        }

        if (categoriaId.HasValue)
        {
            var categoria = await _db.Categorias
                .FirstOrDefaultAsync(c => c.Id == categoriaId.Value && (c.UserId == userId || c.UserId == 0));

            if (categoria is null)
            {
                return "A categoria informada não foi encontrada.";
            }

            if (categoria.Tipo != tipo)
            {
                return "O tipo da categoria deve ser igual ao tipo do lançamento.";
            }
        }

        if (subcategoriaId.HasValue)
        {
            if (!categoriaId.HasValue)
            {
                return "A subcategoria exige uma categoria vinculada.";
            }

            var subcategoria = await _db.Subcategorias
                .Include(s => s.Categoria)
                .FirstOrDefaultAsync(s => s.Id == subcategoriaId.Value && s.UserId == userId);

            if (subcategoria is null)
            {
                return "A subcategoria informada não foi encontrada.";
            }

            if (subcategoria.CategoriaId != categoriaId.Value)
            {
                return "A subcategoria deve pertencer à categoria informada.";
            }

            if (subcategoria.Categoria.Tipo != tipo)
            {
                return "O tipo da subcategoria deve ser compatível com o tipo do lançamento.";
            }
        }

        return null;
    }

    private static Expression<Func<LancamentoFinanceiro, LancamentoFinanceiroResponse>> MapearResponse()
    {
        return l => new LancamentoFinanceiroResponse
        {
            Id = l.Id,
            Tipo = l.Tipo,
            Valor = l.Valor,
            Data = l.Data,
            Descricao = l.Descricao,
            CategoriaId = l.CategoriaId,
            CategoriaNome = l.Categoria != null ? l.Categoria.Nome : null,
            SubcategoriaId = l.SubcategoriaId,
            SubcategoriaNome = l.Subcategoria != null ? l.Subcategoria.Nome : null,
            ContaFinanceiraId = l.ContaFinanceiraId,
            ContaFinanceiraNome = l.ContaFinanceira.Nome,
            Origem = l.Origem,
            OrigemId = l.OrigemId
        };
    }
}