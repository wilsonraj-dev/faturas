using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ILembretePagamentoService
{
    Task<List<LembretePagamentoResponse>> ListarAsync(int userId);
    Task<LembretePagamentoResponse> CriarAsync(CriarLembretePagamentoRequest request, int userId);
    Task<LembretePagamentoResponse?> AtualizarAsync(int id, AtualizarLembretePagamentoRequest request, int userId);
    Task<bool> ExcluirAsync(int id, int userId);
    Task<bool> AtivarAsync(int id, int userId);
    Task<bool> DesativarAsync(int id, int userId);
}