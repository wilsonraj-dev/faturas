using System.Security.Claims;
using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContasFinanceirasController : ControllerBase
{
    private readonly IContaFinanceiraService _contaFinanceiraService;

    public ContasFinanceirasController(IContaFinanceiraService contaFinanceiraService)
    {
        _contaFinanceiraService = contaFinanceiraService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<ContaFinanceiraResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ContaFinanceiraResponse>>> Listar([FromQuery] int? instituicaoId)
    {
        var contas = await _contaFinanceiraService.ListarAsync(GetUserId(), instituicaoId);
        return Ok(contas);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ContaFinanceiraResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContaFinanceiraResponse>> Obter(int id)
    {
        var conta = await _contaFinanceiraService.ObterAsync(id, GetUserId());
        if (conta is null)
        {
            return NotFound("Conta financeira não encontrada.");
        }

        return Ok(conta);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ContaFinanceiraResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ContaFinanceiraResponse>> Criar([FromBody] CriarContaFinanceiraRequest request)
    {
        var resultado = await _contaFinanceiraService.CriarAsync(request, GetUserId());
        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return CreatedAtAction(nameof(Obter), new { id = resultado.Data!.Id }, resultado.Data);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ContaFinanceiraResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContaFinanceiraResponse>> Atualizar(int id, [FromBody] AtualizarContaFinanceiraRequest request)
    {
        var resultado = await _contaFinanceiraService.AtualizarAsync(id, request, GetUserId());
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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deletar(int id)
    {
        var resultado = await _contaFinanceiraService.DeletarAsync(id, GetUserId());
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