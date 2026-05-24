using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/compras-recorrentes")]
[Authorize]
public class ComprasRecorrentesController : ControllerBase
{
    private readonly ICompraRecorrenteService _compraRecorrenteService;

    public ComprasRecorrentesController(ICompraRecorrenteService compraRecorrenteService)
    {
        _compraRecorrenteService = compraRecorrenteService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<CompraRecorrenteResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CompraRecorrenteResponse>>> Listar()
    {
        var comprasRecorrentes = await _compraRecorrenteService.ListarAsync(GetUserId());
        return Ok(comprasRecorrentes);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CompraRecorrenteResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CompraRecorrenteResponse>> Criar([FromBody] CriarCompraRecorrenteRequest request)
    {
        var userId = GetUserId();
        var erroValidacao = Validar(request.Nome, request.ValorMensal, request.DiaCobranca, request.ContaFinanceiraId);
        if (erroValidacao is not null)
        {
            return BadRequest(erroValidacao);
        }

        if (!await _compraRecorrenteService.ContaFinanceiraExisteAsync(request.ContaFinanceiraId, userId))
            return BadRequest("Conta financeira não encontrada.");

        if (request.CategoriaId.HasValue && !await _compraRecorrenteService.CategoriaExisteAsync(request.CategoriaId.Value, userId))
            return BadRequest("Categoria não encontrada.");

        if (request.SubcategoriaId.HasValue && !await _compraRecorrenteService.SubcategoriaExisteAsync(request.SubcategoriaId.Value, userId))
            return BadRequest("Subcategoria não encontrada.");

        var resultado = await _compraRecorrenteService.CriarAsync(request, userId);
        return StatusCode(StatusCodes.Status201Created, resultado);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CompraRecorrenteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompraRecorrenteResponse>> Atualizar(int id, [FromBody] AtualizarCompraRecorrenteRequest request)
    {
        var userId = GetUserId();
        var erroValidacao = Validar(request.Nome, request.ValorMensal, request.DiaCobranca, request.ContaFinanceiraId);
        if (erroValidacao is not null)
        {
            return BadRequest(erroValidacao);
        }

        if (!await _compraRecorrenteService.ContaFinanceiraExisteAsync(request.ContaFinanceiraId, userId))
            return BadRequest("Conta financeira não encontrada.");

        if (request.CategoriaId.HasValue && !await _compraRecorrenteService.CategoriaExisteAsync(request.CategoriaId.Value, userId))
            return BadRequest("Categoria não encontrada.");

        if (request.SubcategoriaId.HasValue && !await _compraRecorrenteService.SubcategoriaExisteAsync(request.SubcategoriaId.Value, userId))
            return BadRequest("Subcategoria não encontrada.");

        var resultado = await _compraRecorrenteService.AtualizarAsync(id, request, userId);
        if (resultado is null)
        {
            return NotFound("Compra recorrente não encontrada.");
        }

        return Ok(resultado);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Desativar(int id)
    {
        var sucesso = await _compraRecorrenteService.DesativarAsync(id, GetUserId());
        if (!sucesso)
        {
            return NotFound("Compra recorrente não encontrada.");
        }

        return NoContent();
    }

    private static string? Validar(string nome, decimal valorMensal, int diaCobranca, int contaFinanceiraId)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            return "O nome é obrigatório.";
        }

        if (contaFinanceiraId <= 0)
        {
            return "A conta financeira é obrigatória.";
        }

        if (valorMensal <= 0)
        {
            return "O valor mensal deve ser maior que zero.";
        }

        if (diaCobranca < 1 || diaCobranca > 31)
        {
            return "O dia de cobrança deve estar entre 1 e 31.";
        }

        return null;
    }
}
