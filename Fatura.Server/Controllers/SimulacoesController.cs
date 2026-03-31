using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SimulacoesController : ControllerBase
{
    private readonly ISimulacaoService _simulacaoService;

    public SimulacoesController(ISimulacaoService simulacaoService)
    {
        _simulacaoService = simulacaoService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<SimulacaoResumoResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SimulacaoResumoResponse>>> Listar()
    {
        var simulacoes = await _simulacaoService.ListarAsync(GetUserId());
        return Ok(simulacoes);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SimulacaoDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SimulacaoDetalheResponse>> Obter(int id)
    {
        var simulacao = await _simulacaoService.ObterAsync(id, GetUserId());
        if (simulacao is null)
            return NotFound("Simulação não encontrada.");

        return Ok(simulacao);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SimulacaoDetalheResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SimulacaoDetalheResponse>> Criar([FromBody] CriarSimulacaoRequest request)
    {
        if (request.NumeroParcelas < 1)
            return BadRequest("O número de parcelas deve ser pelo menos 1.");

        if (request.ValorTotal <= 0)
            return BadRequest("O valor total deve ser maior que zero.");

        var resultado = await _simulacaoService.CriarAsync(request, GetUserId());
        return CreatedAtAction(nameof(Obter), new { id = resultado.Id }, resultado);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deletar(int id)
    {
        var sucesso = await _simulacaoService.DeletarAsync(id, GetUserId());
        if (!sucesso)
            return NotFound("Simulação não encontrada.");

        return NoContent();
    }

    [HttpPost("{id}/converter")]
    [ProducesResponseType(typeof(CompraResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompraResponse>> ConverterEmCompra(int id)
    {
        var resultado = await _simulacaoService.ConverterEmCompraAsync(id, GetUserId());
        if (resultado is null)
            return NotFound("Simulação não encontrada.");

        return Ok(resultado);
    }
}
