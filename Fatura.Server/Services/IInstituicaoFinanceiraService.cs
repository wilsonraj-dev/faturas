using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IInstituicaoFinanceiraService
{
    Task<List<InstituicaoFinanceiraResponse>> ListarAsync(int userId);
    Task<InstituicaoFinanceiraDetalheResponse?> ObterAsync(int id, int userId);
    Task<ServiceResult<InstituicaoFinanceiraResponse>> CriarAsync(CriarInstituicaoFinanceiraRequest request, int userId);
    Task<ServiceResult<InstituicaoFinanceiraResponse>> AtualizarAsync(int id, AtualizarInstituicaoFinanceiraRequest request, int userId);
    Task<ServiceResult> DeletarAsync(int id, int userId);
}