using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaturasController : ControllerBase
{
    private readonly IFaturaService _faturaService;

    public FaturasController(IFaturaService faturaService)
    {
        _faturaService = faturaService;
    }

    /// <summary>
    /// Lista todas as faturas de um determinado ano.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<FaturaResumoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<FaturaResumoResponse>>> ListarFaturas([FromQuery] int ano)
    {
        if (ano < 2000 || ano > 2100)
            return BadRequest("Ano inválido.");

        var faturas = await _faturaService.ListarFaturasAsync(ano);
        return Ok(faturas);
    }

    /// <summary>
    /// Obtém os detalhes de uma fatura específica com suas parcelas.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FaturaDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FaturaDetalheResponse>> ObterFatura(int id)
    {
        var fatura = await _faturaService.ObterFaturaAsync(id);
        if (fatura is null)
            return NotFound("Fatura não encontrada.");

        return Ok(fatura);
    }

    /// <summary>
    /// Marca uma fatura como quitada.
    /// </summary>
    [HttpPut("{id}/quitar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> QuitarFatura(int id)
    {
        var sucesso = await _faturaService.QuitarFaturaAsync(id);
        if (!sucesso)
            return NotFound("Fatura não encontrada.");

        return NoContent();
    }

    /// <summary>
    /// Reabre uma fatura previamente quitada.
    /// </summary>
    [HttpPut("{id}/reabrir")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReabrirFatura(int id)
    {
        var sucesso = await _faturaService.ReabrirFaturaAsync(id);
        if (!sucesso)
            return NotFound("Fatura não encontrada.");

        return NoContent();
    }

    /// <summary>
    /// Atualiza o orçamento de uma fatura.
    /// </summary>
    [HttpPut("{id}/orcamento")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarOrcamento(int id, [FromBody] AtualizarOrcamentoRequest request)
    {
        var sucesso = await _faturaService.AtualizarOrcamentoAsync(id, request.Orcamento);
        if (!sucesso)
            return NotFound("Fatura não encontrada.");

        return NoContent();
    }

    /// <summary>
    /// Retorna dados para o dashboard com totais por mês.
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(List<FaturaResumoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<FaturaResumoResponse>>> Dashboard([FromQuery] int ano)
    {
        if (ano < 2000 || ano > 2100)
            return BadRequest("Ano inválido.");

        var dados = await _faturaService.ObterDashboardAsync(ano);
        return Ok(dados);
    }

    /// <summary>
    /// Exporta as faturas para um arquivo Excel (.xlsx).
    /// </summary>
    [HttpGet("exportar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportarExcel([FromQuery] int? ano)
    {
        var bytes = await _faturaService.ExportarExcelAsync(ano);
        var nomeArquivo = ano.HasValue ? $"faturas_{ano}.xlsx" : "faturas.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nomeArquivo);
    }
}
