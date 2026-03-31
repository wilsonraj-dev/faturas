using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class FornecedorService : IFornecedorService
{
    private readonly AppDbContext _db;

    public FornecedorService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<FornecedorResponse>> ListarAsync(int userId)
    {
        return await _db.Fornecedores
            .Where(f => f.UserId == userId)
            .OrderBy(f => f.Nome)
            .Select(f => new FornecedorResponse
            {
                Id = f.Id,
                Nome = f.Nome
            })
            .ToListAsync();
    }

    public async Task<FornecedorResponse?> ObterAsync(int id, int userId)
    {
        var fornecedor = await _db.Fornecedores.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        if (fornecedor is null) return null;

        return new FornecedorResponse
        {
            Id = fornecedor.Id,
            Nome = fornecedor.Nome
        };
    }

    public async Task<FornecedorResponse> CriarAsync(CriarFornecedorRequest request, int userId)
    {
        var fornecedor = new Fornecedor
        {
            Nome = request.Nome,
            UserId = userId
        };

        _db.Fornecedores.Add(fornecedor);
        await _db.SaveChangesAsync();

        return new FornecedorResponse
        {
            Id = fornecedor.Id,
            Nome = fornecedor.Nome
        };
    }

    public async Task<FornecedorResponse?> AtualizarAsync(int id, CriarFornecedorRequest request, int userId)
    {
        var fornecedor = await _db.Fornecedores.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        if (fornecedor is null) return null;

        fornecedor.Nome = request.Nome;
        await _db.SaveChangesAsync();

        return new FornecedorResponse
        {
            Id = fornecedor.Id,
            Nome = fornecedor.Nome
        };
    }

    public async Task<bool> DeletarAsync(int id, int userId)
    {
        var fornecedor = await _db.Fornecedores.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        if (fornecedor is null) return false;

        _db.Fornecedores.Remove(fornecedor);
        await _db.SaveChangesAsync();
        return true;
    }
}
