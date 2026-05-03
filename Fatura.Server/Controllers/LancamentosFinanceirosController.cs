using System.Security.Claims;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LancamentosFinanceirosController : ControllerBase
{
    private readonly ILancamentoFinanceiroService _lancamentoFinanceiroService;

    public LancamentosFinanceirosController(ILancamentoFinanceiroService lancamentoFinanceiroService)
    {
        _lancamentoFinanceiroService = lancamentoFinanceiroService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<LancamentoFinanceiroResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LancamentoFinanceiroResponse>>> Listar(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] TipoCategoria? tipo)
    {
        var lancamentos = await _lancamentoFinanceiroService.ListarAsync(GetUserId(), dataInicial, dataFinal, tipo);
        return Ok(lancamentos);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LancamentoFinanceiroResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LancamentoFinanceiroResponse>> Obter(int id)
    {
        var lancamento = await _lancamentoFinanceiroService.ObterAsync(id, GetUserId());
        if (lancamento is null)
        {
            return NotFound("Lançamento financeiro não encontrado.");
        }

        return Ok(lancamento);
    }

    [HttpPost]
    [ProducesResponseType(typeof(LancamentoFinanceiroResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LancamentoFinanceiroResponse>> Criar([FromBody] CriarLancamentoFinanceiroRequest request)
    {
        var resultado = await _lancamentoFinanceiroService.CriarAsync(request, GetUserId());
        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return CreatedAtAction(nameof(Obter), new { id = resultado.Data!.Id }, resultado.Data);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LancamentoFinanceiroResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LancamentoFinanceiroResponse>> Atualizar(int id, [FromBody] AtualizarLancamentoFinanceiroRequest request)
    {
        var resultado = await _lancamentoFinanceiroService.AtualizarAsync(id, request, GetUserId());
        if (resultado.NotFound)
        {
            return NotFound(resultado.Error);
        }

        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return Ok(resultado.Data);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deletar(int id)
    {
        var resultado = await _lancamentoFinanceiroService.DeletarAsync(id, GetUserId());
        if (resultado.NotFound)
        {
            return NotFound(resultado.Error);
        }

        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return NoContent();
    }
}