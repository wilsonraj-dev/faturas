using Fatura.Server.DTOs;
using Fatura.Server.Models;

namespace Fatura.Server.Services;

public interface ICategoriaService
{
    Task<List<CategoriaResponse>> ListarAsync(int userId, TipoCategoria? tipo);
    Task<CategoriaDetalheResponse?> ObterAsync(int id, int userId);
    Task<ServiceResult<CategoriaResponse>> CriarAsync(CriarCategoriaRequest request, int userId);
    Task<ServiceResult<CategoriaResponse>> AtualizarAsync(int id, AtualizarCategoriaRequest request, int userId);
    Task<ServiceResult> DeletarAsync(int id, int userId);
}