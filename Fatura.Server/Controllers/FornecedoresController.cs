using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FornecedoresController : ControllerBase
{
    private readonly IFornecedorService _fornecedorService;

    public FornecedoresController(IFornecedorService fornecedorService)
    {
        _fornecedorService = fornecedorService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<FornecedorResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<FornecedorResponse>>> Listar()
    {
        var fornecedores = await _fornecedorService.ListarAsync();
        return Ok(fornecedores);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FornecedorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FornecedorResponse>> Obter(int id)
    {
        var fornecedor = await _fornecedorService.ObterAsync(id);
        if (fornecedor is null)
            return NotFound("Fornecedor não encontrado.");

        return Ok(fornecedor);
    }

    [HttpPost]
    [ProducesResponseType(typeof(FornecedorResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FornecedorResponse>> Criar([FromBody] CriarFornecedorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest("O nome do fornecedor é obrigatório.");

        var resultado = await _fornecedorService.CriarAsync(request);
        return CreatedAtAction(nameof(Obter), new { id = resultado.Id }, resultado);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(FornecedorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FornecedorResponse>> Atualizar(int id, [FromBody] CriarFornecedorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest("O nome do fornecedor é obrigatório.");

        var resultado = await _fornecedorService.AtualizarAsync(id, request);
        if (resultado is null)
            return NotFound("Fornecedor não encontrado.");

        return Ok(resultado);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deletar(int id)
    {
        var sucesso = await _fornecedorService.DeletarAsync(id);
        if (!sucesso)
            return NotFound("Fornecedor não encontrado.");

        return NoContent();
    }
}
