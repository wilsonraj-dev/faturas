namespace Fatura.Server.Models;

/// <summary>
/// Representa um fornecedor de produtos/serviços.
/// </summary>
public class Fornecedor
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int UserId { get; set; }

    // Navegação: compras vinculadas a este fornecedor
    public List<Compra> Compras { get; set; } = [];
    public User User { get; set; } = null!;
}
