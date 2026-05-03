using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ISubcategoriaService
{
    Task<List<SubcategoriaResponse>> ListarAsync(int userId, int? categoriaId);
    Task<SubcategoriaResponse?> ObterAsync(int id, int userId);
    Task<ServiceResult<SubcategoriaResponse>> CriarAsync(CriarSubcategoriaRequest request, int userId);
    Task<ServiceResult<SubcategoriaResponse>> AtualizarAsync(int id, AtualizarSubcategoriaRequest request, int userId);
    Task<ServiceResult> DeletarAsync(int id, int userId);
}