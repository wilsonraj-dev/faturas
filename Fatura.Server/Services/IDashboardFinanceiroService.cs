using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IDashboardFinanceiroService
{
    Task<DashboardFinanceiroResumoResponse> ObterResumoAsync(int userId, DashboardFinanceiroFiltroRequest filtro);
    Task<List<DashboardFinanceiroSerieMensalItem>> ObterReceitaDespesaAsync(int userId, DashboardFinanceiroFiltroRequest filtro);
    Task<List<DashboardFinanceiroAgrupamentoItem>> ObterCategoriasAsync(int userId, DashboardFinanceiroFiltroRequest filtro);
    Task<List<DashboardFinanceiroAgrupamentoItem>> ObterSubcategoriasAsync(int userId, DashboardFinanceiroFiltroRequest filtro);
    Task<List<DashboardFinanceiroSerieMensalItem>> ObterEvolucaoAsync(int userId, DashboardFinanceiroFiltroRequest filtro);
    Task<DashboardFinanceiroComparativoResponse> ObterComparativoAsync(int userId, DashboardFinanceiroComparativoRequest request);
    Task<DashboardFinanceiroRankingsResponse> ObterRankingsAsync(int userId, DashboardFinanceiroFiltroRequest filtro);
}
