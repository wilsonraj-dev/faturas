using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IContaFinanceiraService
{
    Task<List<ContaFinanceiraResponse>> ListarAsync(int userId, int? instituicaoId);
    Task<ContaFinanceiraResponse?> ObterAsync(int id, int userId);
    Task<ServiceResult<ContaFinanceiraResponse>> CriarAsync(CriarContaFinanceiraRequest request, int userId);
    Task<ServiceResult<ContaFinanceiraResponse>> AtualizarAsync(int id, AtualizarContaFinanceiraRequest request, int userId);
    Task<ServiceResult> DeletarAsync(int id, int userId);
}