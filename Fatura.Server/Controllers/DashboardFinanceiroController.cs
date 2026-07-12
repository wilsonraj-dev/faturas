using System.Security.Claims;
using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/dashboard-financeiro")]
[Authorize]
public class DashboardFinanceiroController : ControllerBase
{
    private readonly IDashboardFinanceiroService _dashboardFinanceiroService;

    public DashboardFinanceiroController(IDashboardFinanceiroService dashboardFinanceiroService)
    {
        _dashboardFinanceiroService = dashboardFinanceiroService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("resumo")]
    public async Task<ActionResult<DashboardFinanceiroResumoResponse>> ObterResumo([FromQuery] DashboardFinanceiroFiltroRequest filtro)
    {
        return Ok(await _dashboardFinanceiroService.ObterResumoAsync(GetUserId(), filtro));
    }

    [HttpGet("receita-despesa")]
    public async Task<ActionResult<List<DashboardFinanceiroSerieMensalItem>>> ObterReceitaDespesa([FromQuery] DashboardFinanceiroFiltroRequest filtro)
    {
        return Ok(await _dashboardFinanceiroService.ObterReceitaDespesaAsync(GetUserId(), filtro));
    }

    [HttpGet("categorias")]
    public async Task<ActionResult<List<DashboardFinanceiroAgrupamentoItem>>> ObterCategorias([FromQuery] DashboardFinanceiroFiltroRequest filtro)
    {
        return Ok(await _dashboardFinanceiroService.ObterCategoriasAsync(GetUserId(), filtro));
    }

    [HttpGet("subcategorias")]
    public async Task<ActionResult<List<DashboardFinanceiroAgrupamentoItem>>> ObterSubcategorias([FromQuery] DashboardFinanceiroFiltroRequest filtro)
    {
        return Ok(await _dashboardFinanceiroService.ObterSubcategoriasAsync(GetUserId(), filtro));
    }

    [HttpGet("evolucao")]
    public async Task<ActionResult<List<DashboardFinanceiroSerieMensalItem>>> ObterEvolucao([FromQuery] DashboardFinanceiroFiltroRequest filtro)
    {
        return Ok(await _dashboardFinanceiroService.ObterEvolucaoAsync(GetUserId(), filtro));
    }

    [HttpGet("comparativo")]
    public async Task<ActionResult<DashboardFinanceiroComparativoResponse>> ObterComparativo([FromQuery] DashboardFinanceiroComparativoRequest request)
    {
        return Ok(await _dashboardFinanceiroService.ObterComparativoAsync(GetUserId(), request));
    }

    [HttpGet("rankings")]
    public async Task<ActionResult<DashboardFinanceiroRankingsResponse>> ObterRankings([FromQuery] DashboardFinanceiroFiltroRequest filtro)
    {
        return Ok(await _dashboardFinanceiroService.ObterRankingsAsync(GetUserId(), filtro));
    }
}
