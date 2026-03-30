using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IFaturaService
{
    Task<List<FaturaResumoResponse>> ListarFaturasAsync(int ano);
    Task<FaturaDetalheResponse?> ObterFaturaAsync(int id);
    Task<bool> QuitarFaturaAsync(int id);
    Task<bool> ReabrirFaturaAsync(int id);
    Task<bool> AtualizarOrcamentoAsync(int id, double orcamento);
    Task<List<FaturaResumoResponse>> ObterDashboardAsync(int ano);
    Task<byte[]> ExportarExcelAsync(int? ano);
}
