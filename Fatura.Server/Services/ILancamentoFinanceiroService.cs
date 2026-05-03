using Fatura.Server.DTOs;
using Fatura.Server.Models;

namespace Fatura.Server.Services;

public interface ILancamentoFinanceiroService
{
    Task<List<LancamentoFinanceiroResponse>> ListarAsync(int userId, DateTime? dataInicial, DateTime? dataFinal, TipoCategoria? tipo);
    Task<LancamentoFinanceiroResponse?> ObterAsync(int id, int userId);
    Task<ServiceResult<LancamentoFinanceiroResponse>> CriarAsync(CriarLancamentoFinanceiroRequest request, int userId);
    Task<ServiceResult<LancamentoFinanceiroResponse>> AtualizarAsync(int id, AtualizarLancamentoFinanceiroRequest request, int userId);
    Task<ServiceResult> DeletarAsync(int id, int userId);
}