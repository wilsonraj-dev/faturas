using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IFaturaService
{
    Task<List<FaturaResumoResponse>> ListarFaturasAsync(int ano, int userId);
    Task<FaturaDetalheResponse?> ObterFaturaAsync(int id, int userId);
    Task<bool> QuitarFaturaAsync(int id, int userId);
    Task<bool> ReabrirFaturaAsync(int id, int userId);
    Task<bool> AtualizarOrcamentoAsync(int id, double orcamento, int userId);
    Task<List<FaturaResumoResponse>> ObterDashboardAsync(int ano, int userId);
    Task<byte[]> ExportarExcelAsync(int? ano, int userId);
}
