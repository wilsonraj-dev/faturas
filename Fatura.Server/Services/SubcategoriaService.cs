using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class SubcategoriaService : ISubcategoriaService
{
    private readonly AppDbContext _db;

    public SubcategoriaService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SubcategoriaResponse>> ListarAsync(int userId, int? categoriaId)
    {
        var query = _db.Subcategorias
            .AsNoTracking()
            .Where(s => s.UserId == userId);

        if (categoriaId.HasValue)
        {
            query = query.Where(s => s.CategoriaId == categoriaId.Value);
        }

        return await query
            .OrderBy(s => s.Nome)
            .Select(s => new SubcategoriaResponse
            {
                Id = s.Id,
                Nome = s.Nome,
                CategoriaId = s.CategoriaId,
                CategoriaNome = s.Categoria.Nome
            })
            .ToListAsync();
    }

    public async Task<SubcategoriaResponse?> ObterAsync(int id, int userId)
    {
        return await _db.Subcategorias
            .AsNoTracking()
            .Where(s => s.Id == id && s.UserId == userId)
            .Select(s => new SubcategoriaResponse
            {
                Id = s.Id,
                Nome = s.Nome,
                CategoriaId = s.CategoriaId,
                CategoriaNome = s.Categoria.Nome
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceResult<SubcategoriaResponse>> CriarAsync(CriarSubcategoriaRequest request, int userId)
    {
        var validacao = await ValidarAsync(request.Nome, request.CategoriaId, userId);
        if (validacao is not null)
        {
            return ServiceResult<SubcategoriaResponse>.Invalid(validacao);
        }

        var subcategoria = new Models.Subcategoria
        {
            Nome = request.Nome.Trim(),
            CategoriaId = request.CategoriaId,
            UserId = userId
        };

        _db.Subcategorias.Add(subcategoria);
        await _db.SaveChangesAsync();

        var categoriaNome = await _db.Categorias
            .Where(c => c.Id == request.CategoriaId)
            .Select(c => c.Nome)
            .FirstAsync();

        return ServiceResult<SubcategoriaResponse>.Ok(new SubcategoriaResponse
        {
            Id = subcategoria.Id,
            Nome = subcategoria.Nome,
            CategoriaId = subcategoria.CategoriaId,
            CategoriaNome = categoriaNome
        });
    }

    public async Task<ServiceResult<SubcategoriaResponse>> AtualizarAsync(int id, AtualizarSubcategoriaRequest request, int userId)
    {
        var subcategoria = await _db.Subcategorias
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (subcategoria is null)
        {
            return ServiceResult<SubcategoriaResponse>.NotFoundResult("Subcategoria não encontrada.");
        }

        var validacao = await ValidarAsync(request.Nome, request.CategoriaId, userId, id);
        if (validacao is not null)
        {
            return ServiceResult<SubcategoriaResponse>.Invalid(validacao);
        }

        subcategoria.Nome = request.Nome.Trim();
        subcategoria.CategoriaId = request.CategoriaId;
        await _db.SaveChangesAsync();

        var categoriaNome = await _db.Categorias
            .Where(c => c.Id == request.CategoriaId)
            .Select(c => c.Nome)
            .FirstAsync();

        return ServiceResult<SubcategoriaResponse>.Ok(new SubcategoriaResponse
        {
            Id = subcategoria.Id,
            Nome = subcategoria.Nome,
            CategoriaId = subcategoria.CategoriaId,
            CategoriaNome = categoriaNome
        });
    }

    public async Task<ServiceResult> DeletarAsync(int id, int userId)
    {
        var subcategoria = await _db.Subcategorias
            .Include(s => s.Lancamentos)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (subcategoria is null)
        {
            return ServiceResult.NotFoundResult("Subcategoria não encontrada.");
        }

        if (subcategoria.Lancamentos.Count > 0)
        {
            return ServiceResult.Invalid("Não é possível excluir uma subcategoria com lançamentos vinculados.");
        }

        _db.Subcategorias.Remove(subcategoria);
        await _db.SaveChangesAsync();
        return ServiceResult.Ok();
    }

    private async Task<string?> ValidarAsync(string nome, int categoriaId, int userId, int? subcategoriaId = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            return "O nome da subcategoria é obrigatório.";
        }

        var categoria = await _db.Categorias
            .FirstOrDefaultAsync(c => c.Id == categoriaId && (c.UserId == userId || c.UserId == 0));

        if (categoria is null)
        {
            return "A categoria informada não foi encontrada.";
        }

        if (categoria.UserId == 0)
        {
            return "Não é permitido vincular subcategorias a categorias padrão do sistema.";
        }

        var nomeNormalizado = nome.Trim();
        var existe = await _db.Subcategorias
            .AnyAsync(s => s.UserId == userId
                && s.CategoriaId == categoriaId
                && s.Nome == nomeNormalizado
                && (!subcategoriaId.HasValue || s.Id != subcategoriaId.Value));

        if (existe)
        {
            return "Já existe uma subcategoria com esse nome para a categoria informada.";
        }

        return null;
    }
}