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
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaService _categoriaService;

    public CategoriasController(ICategoriaService categoriaService)
    {
        _categoriaService = categoriaService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(typeof(List<CategoriaResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CategoriaResponse>>> Listar([FromQuery] TipoCategoria? tipo)
    {
        var categorias = await _categoriaService.ListarAsync(GetUserId(), tipo);
        return Ok(categorias);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CategoriaDetalheResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoriaDetalheResponse>> Obter(int id)
    {
        var categoria = await _categoriaService.ObterAsync(id, GetUserId());
        if (categoria is null)
        {
            return NotFound("Categoria não encontrada.");
        }

        return Ok(categoria);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CategoriaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoriaResponse>> Criar([FromBody] CriarCategoriaRequest request)
    {
        var resultado = await _categoriaService.CriarAsync(request, GetUserId());
        if (!resultado.Success)
        {
            return BadRequest(resultado.Error);
        }

        return CreatedAtAction(nameof(Obter), new { id = resultado.Data!.Id }, resultado.Data);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CategoriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoriaResponse>> Atualizar(int id, [FromBody] AtualizarCategoriaRequest request)
    {
        var resultado = await _categoriaService.AtualizarAsync(id, request, GetUserId());
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
        var resultado = await _categoriaService.DeletarAsync(id, GetUserId());
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