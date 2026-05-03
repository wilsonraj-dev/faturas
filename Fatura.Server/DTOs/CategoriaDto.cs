using Fatura.Server.Models;

namespace Fatura.Server.DTOs;

public class CriarCategoriaRequest
{
    public string Nome { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
}

public class AtualizarCategoriaRequest
{
    public string Nome { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
}

public class CategoriaResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
    public int QuantidadeSubcategorias { get; set; }
}

public class CategoriaDetalheResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
    public List<SubcategoriaResponse> Subcategorias { get; set; } = [];
}