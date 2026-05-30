using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IFaturaService
{
    Task<List<FaturaResumoResponse>> ListarFaturasAsync(int ano, int userId);
    Task<FaturaDetalheResponse?> ObterFaturaAsync(int id, int userId);
    Task<ServiceResult> QuitarFaturaAsync(int id, int userId, DateTime? dataPagamento = null);
    Task<ServiceResult> ReabrirFaturaAsync(int id, int userId);
    Task<ServiceResult> AtualizarOrcamentoAsync(int id, double orcamento, int userId);
    Task<List<FaturaResumoResponse>> ObterDashboardAsync(int ano, int userId);
    Task<byte[]> ExportarExcelAsync(int? ano, int userId);
}
