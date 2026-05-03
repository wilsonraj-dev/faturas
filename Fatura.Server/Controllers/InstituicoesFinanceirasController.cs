using System.Security.Claims;
using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InstituicoesFinanceirasController : ControllerBase
{
    private readonly IInstituicaoFinanceiraService _instituicaoFinanceiraService;

    public InstituicoesFinanceirasController(IInstituicaoFinanceiraService instituicaoFinanceiraService)
    {
        _instituicaoFinanceiraService = instituicaoFinanceiraService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<InstituicaoFinanceiraResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InstituicaoFinanceiraResponse>>> Listar()
    {
        var instituicoes = await _instituicaoFinanceiraService.ListarAsync(GetUserId());
        return Ok(instituicoes);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InstituicaoFinanceiraDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InstituicaoFinanceiraDetalheResponse>> Obter(int id)
    {
        var instituicao = await _instituicaoFinanceiraService.ObterAsync(id, GetUserId());
        if (instituicao is null)
        {
            return NotFound("Instituição financeira não encontrada.");
        }

        return Ok(instituicao);
    }

    [HttpPost]
    [ProducesResponseType(typeof(InstituicaoFinanceiraResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InstituicaoFinanceiraResponse>> Criar([FromBody] CriarInstituicaoFinanceiraRequest request)
    {
        var resultado = await _instituicaoFinanceiraService.CriarAsync(request, GetUserId());
        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return CreatedAtAction(nameof(Obter), new { id = resultado.Data!.Id }, resultado.Data);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(InstituicaoFinanceiraResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InstituicaoFinanceiraResponse>> Atualizar(int id, [FromBody] AtualizarInstituicaoFinanceiraRequest request)
    {
        var resultado = await _instituicaoFinanceiraService.AtualizarAsync(id, request, GetUserId());
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
        var resultado = await _instituicaoFinanceiraService.DeletarAsync(id, GetUserId());
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