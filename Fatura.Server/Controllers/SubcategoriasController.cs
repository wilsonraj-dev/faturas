using System.Security.Claims;
using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubcategoriasController : ControllerBase
{
    private readonly ISubcategoriaService _subcategoriaService;

    public SubcategoriasController(ISubcategoriaService subcategoriaService)
    {
        _subcategoriaService = subcategoriaService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<SubcategoriaResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SubcategoriaResponse>>> Listar([FromQuery] int? categoriaId)
    {
        var subcategorias = await _subcategoriaService.ListarAsync(GetUserId(), categoriaId);
        return Ok(subcategorias);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SubcategoriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcategoriaResponse>> Obter(int id)
    {
        var subcategoria = await _subcategoriaService.ObterAsync(id, GetUserId());
        if (subcategoria is null)
        {
            return NotFound("Subcategoria não encontrada.");
        }

        return Ok(subcategoria);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SubcategoriaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SubcategoriaResponse>> Criar([FromBody] CriarSubcategoriaRequest request)
    {
        var resultado = await _subcategoriaService.CriarAsync(request, GetUserId());
        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return CreatedAtAction(nameof(Obter), new { id = resultado.Data!.Id }, resultado.Data);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SubcategoriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubcategoriaResponse>> Atualizar(int id, [FromBody] AtualizarSubcategoriaRequest request)
    {
        var resultado = await _subcategoriaService.AtualizarAsync(id, request, GetUserId());
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
        var resultado = await _subcategoriaService.DeletarAsync(id, GetUserId());
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