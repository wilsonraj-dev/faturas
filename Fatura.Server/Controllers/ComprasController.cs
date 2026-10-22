using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComprasController : ControllerBase
{
    private readonly ICompraService _compraService;

    public ComprasController(ICompraService compraService)
    {
        _compraService = compraService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Cria uma nova compra parcelada e gera as parcelas automaticamente.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CompraResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CompraResponse>> CriarCompra([FromBody] CriarCompraRequest request)
    {
        var erro = await ValidarCompraAsync(request);
        if (erro is not null) return BadRequest(erro);

        var resultado = await _compraService.CriarCompraAsync(request, GetUserId());
        return CreatedAtAction(nameof(CriarCompra), new { id = resultado.Id }, resultado);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CompraResponse>> ObterCompra(int id)
    {
        var compra = await _compraService.ObterCompraAsync(id, GetUserId());
        return compra is null ? NotFound("Compra não encontrada.") : Ok(compra);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CompraResponse>> AtualizarCompra(int id, [FromBody] CriarCompraRequest request)
    {
        var erro = await ValidarCompraAsync(request);
        if (erro is not null) return BadRequest(erro);

        var resultado = await _compraService.AtualizarCompraAsync(id, request, GetUserId());
        if (resultado.NotFound) return NotFound(resultado.Error);
        if (!resultado.Success) return BadRequest(resultado.Error);
        
        return Ok(resultado.Data);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> RemoverCompra(int id)
    {
        var resultado = await _compraService.RemoverCompraAsync(id, GetUserId());
        if (resultado.NotFound) return NotFound(resultado.Error);
        if (!resultado.Success) return BadRequest(resultado.Error);
        
        return NoContent();
    }

    private async Task<string?> ValidarCompraAsync(CriarCompraRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome)) return "O nome da compra é obrigatório.";
        if (request.ContaFinanceiraId <= 0) return "A conta financeira é obrigatória.";
        if (request.NumeroParcelas < 1) return "O número de parcelas deve ser pelo menos 1.";
        if (request.ValorTotal <= 0) return "O valor total deve ser maior que zero.";
        if (!await _compraService.ContaFinanceiraExisteAsync(request.ContaFinanceiraId, GetUserId())) return "Conta financeira não encontrada.";
        if (request.CategoriaId.HasValue && !await _compraService.CategoriaExisteAsync(request.CategoriaId.Value, GetUserId())) return "Categoria não encontrada.";
        if (request.SubcategoriaId.HasValue && !await _compraService.SubcategoriaExisteAsync(request.SubcategoriaId.Value, GetUserId())) return "Subcategoria não encontrada.";
        
        return null;
    }

    /// <summary>
    /// Simula uma compra sem persistir no banco, mostrando como as parcelas
    /// seriam distribuídas nas faturas.
    /// </summary>
    [HttpPost("simular")]
    [ProducesResponseType(typeof(SimulacaoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SimulacaoResponse>> SimularCompra([FromBody] CriarCompraRequest request)
    {
        if (request.ContaFinanceiraId <= 0)
            return BadRequest("A conta financeira é obrigatória.");

        if (request.NumeroParcelas < 1 || request.ValorTotal <= 0)
            return BadRequest("Dados inválidos para simulação.");

        if (!await _compraService.ContaFinanceiraExisteAsync(request.ContaFinanceiraId, GetUserId()))
            return BadRequest("Conta financeira não encontrada.");

        if (request.CategoriaId.HasValue && !await _compraService.CategoriaExisteAsync(request.CategoriaId.Value, GetUserId()))
            return BadRequest("Categoria não encontrada.");

        if (request.SubcategoriaId.HasValue && !await _compraService.SubcategoriaExisteAsync(request.SubcategoriaId.Value, GetUserId()))
            return BadRequest("Subcategoria não encontrada.");

        var resultado = await _compraService.SimularCompraAsync(request);
        return Ok(resultado);
    }
}
