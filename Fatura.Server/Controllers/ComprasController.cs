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
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest("O nome da compra é obrigatório.");

        if (request.NumeroParcelas < 1)
            return BadRequest("O número de parcelas deve ser pelo menos 1.");

        if (request.ValorTotal <= 0)
            return BadRequest("O valor total deve ser maior que zero.");

        var resultado = await _compraService.CriarCompraAsync(request, GetUserId());
        return CreatedAtAction(nameof(CriarCompra), new { id = resultado.Id }, resultado);
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
        if (request.NumeroParcelas < 1 || request.ValorTotal <= 0)
            return BadRequest("Dados inválidos para simulação.");

        var resultado = await _compraService.SimularCompraAsync(request);
        return Ok(resultado);
    }
}
