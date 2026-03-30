namespace Fatura.Server.DTOs;

/// <summary>
/// DTO para criação/edição de um fornecedor.
/// </summary>
public class CriarFornecedorRequest
{
    public string Nome { get; set; } = string.Empty;
}

/// <summary>
/// DTO de resposta de um fornecedor.
/// </summary>
public class FornecedorResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
}
