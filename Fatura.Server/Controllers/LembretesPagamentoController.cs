using System.Security.Claims;
using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/lembretes-pagamento")]
[Authorize]
public class LembretesPagamentoController : ControllerBase
{
    private readonly ILembretePagamentoService _lembretePagamentoService;

    public LembretesPagamentoController(ILembretePagamentoService lembretePagamentoService)
    {
        _lembretePagamentoService = lembretePagamentoService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<LembretePagamentoResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LembretePagamentoResponse>>> Listar()
    {
        var lembretes = await _lembretePagamentoService.ListarAsync(GetUserId());
        return Ok(lembretes);
    }

    [HttpPost]
    [ProducesResponseType(typeof(LembretePagamentoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LembretePagamentoResponse>> Criar([FromBody] CriarLembretePagamentoRequest request)
    {
        try
        {
            var resultado = await _lembretePagamentoService.CriarAsync(request, GetUserId());
            return StatusCode(StatusCodes.Status201Created, resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LembretePagamentoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LembretePagamentoResponse>> Atualizar(int id, [FromBody] AtualizarLembretePagamentoRequest request)
    {
        try
        {
            var resultado = await _lembretePagamentoService.AtualizarAsync(id, request, GetUserId());
            if (resultado is null)
            {
                return NotFound("Lembrete de pagamento não encontrado.");
            }

            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(int id)
    {
        var sucesso = await _lembretePagamentoService.ExcluirAsync(id, GetUserId());
        if (!sucesso)
        {
            return NotFound("Lembrete de pagamento não encontrado.");
        }

        return NoContent();
    }

    [HttpPut("{id}/ativar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Ativar(int id)
    {
        var sucesso = await _lembretePagamentoService.AtivarAsync(id, GetUserId());
        if (!sucesso)
        {
            return NotFound("Lembrete de pagamento não encontrado.");
        }

        return NoContent();
    }

    [HttpPut("{id}/desativar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Desativar(int id)
    {
        var sucesso = await _lembretePagamentoService.DesativarAsync(id, GetUserId());
        if (!sucesso)
        {
            return NotFound("Lembrete de pagamento não encontrado.");
        }

        return NoContent();
    }
}