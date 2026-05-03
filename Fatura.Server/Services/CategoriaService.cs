using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class CategoriaService : ICategoriaService
{
    private readonly AppDbContext _db;

    public CategoriaService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoriaResponse>> ListarAsync(int userId, TipoCategoria? tipo)
    {
        var query = _db.Categorias
            .AsNoTracking()
            .Where(c => c.UserId == userId || c.UserId == 0);

        if (tipo.HasValue)
        {
            query = query.Where(c => c.Tipo == tipo.Value);
        }

        return await query
            .OrderBy(c => c.Nome)
            .Select(c => new CategoriaResponse
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.Tipo,
                QuantidadeSubcategorias = c.Subcategorias.Count
            })
            .ToListAsync();
    }

    public async Task<CategoriaDetalheResponse?> ObterAsync(int id, int userId)
    {
        return await _db.Categorias
            .AsNoTracking()
            .Where(c => c.Id == id && (c.UserId == userId || c.UserId == 0))
            .Select(c => new CategoriaDetalheResponse
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.Tipo,
                Subcategorias = c.Subcategorias
                    .OrderBy(s => s.Nome)
                    .Select(s => new SubcategoriaResponse
                    {
                        Id = s.Id,
                        Nome = s.Nome,
                        CategoriaId = s.CategoriaId,
                        CategoriaNome = c.Nome
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceResult<CategoriaResponse>> CriarAsync(CriarCategoriaRequest request, int userId)
    {
        var erro = await ValidarAsync(request.Nome, request.Tipo, userId);
        if (erro is not null)
        {
            return ServiceResult<CategoriaResponse>.Invalid(erro);
        }

        var categoria = new Categoria
        {
            Nome = request.Nome.Trim(),
            Tipo = request.Tipo,
            UserId = userId
        };

        _db.Categorias.Add(categoria);
        await _db.SaveChangesAsync();

        return ServiceResult<CategoriaResponse>.Ok(new CategoriaResponse
        {
            Id = categoria.Id,
            Nome = categoria.Nome,
            Tipo = categoria.Tipo,
            QuantidadeSubcategorias = 0
        });
    }

    public async Task<ServiceResult<CategoriaResponse>> AtualizarAsync(int id, AtualizarCategoriaRequest request, int userId)
    {
        var categoria = await _db.Categorias
            .Include(c => c.Subcategorias)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (categoria is null)
        {
            return ServiceResult<CategoriaResponse>.NotFoundResult("Categoria não encontrada.");
        }

        var erro = await ValidarAsync(request.Nome, request.Tipo, userId, id);
        if (erro is not null)
        {
            return ServiceResult<CategoriaResponse>.Invalid(erro);
        }

        categoria.Nome = request.Nome.Trim();
        categoria.Tipo = request.Tipo;
        await _db.SaveChangesAsync();

        return ServiceResult<CategoriaResponse>.Ok(new CategoriaResponse
        {
            Id = categoria.Id,
            Nome = categoria.Nome,
            Tipo = categoria.Tipo,
            QuantidadeSubcategorias = categoria.Subcategorias.Count
        });
    }

    public async Task<ServiceResult> DeletarAsync(int id, int userId)
    {
        var categoria = await _db.Categorias
            .Include(c => c.Subcategorias)
            .Include(c => c.Lancamentos)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (categoria is null)
        {
            return ServiceResult.NotFoundResult("Categoria não encontrada.");
        }

        if (categoria.Subcategorias.Count > 0 || categoria.Lancamentos.Count > 0)
        {
            return ServiceResult.Invalid("Não é possível excluir uma categoria com subcategorias ou lançamentos vinculados.");
        }

        _db.Categorias.Remove(categoria);
        await _db.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    private async Task<string?> ValidarAsync(string nome, TipoCategoria tipo, int userId, int? categoriaId = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            return "O nome da categoria é obrigatório.";
        }

        if (!Enum.IsDefined(tipo))
        {
            return "O tipo da categoria é inválido.";
        }

        var nomeNormalizado = nome.Trim();
        var existe = await _db.Categorias
            .AnyAsync(c => c.UserId == userId
                && c.Tipo == tipo
                && c.Nome == nomeNormalizado
                && (!categoriaId.HasValue || c.Id != categoriaId.Value));

        if (existe)
        {
            return "Já existe uma categoria com esse nome e tipo.";
        }

        return null;
    }
}