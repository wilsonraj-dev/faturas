namespace Fatura.Server.Models;

/// <summary>
/// Representa um fornecedor de produtos/serviços.
/// </summary>
public class Fornecedor
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;

    // Navegação: compras vinculadas a este fornecedor
    public List<Compra> Compras { get; set; } = [];
}
