namespace Fatura.Server.DTOs;

public class CriarSubcategoriaRequest
{
    public string Nome { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
}

public class AtualizarSubcategoriaRequest
{
    public string Nome { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
}

public class SubcategoriaResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
    public string CategoriaNome { get; set; } = string.Empty;
}