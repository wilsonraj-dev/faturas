namespace Fatura.Server.Models;

/// <summary>
/// Representa uma compra parcelada no cartão de crédito.
/// </summary>
public class Compra
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime DataCompra { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
    public int? FornecedorId { get; set; }
    public int UserId { get; set; }

    // Navegação: parcelas geradas automaticamente ao cadastrar a compra
    public List<Parcela> Parcelas { get; set; } = [];
    public Fornecedor? Fornecedor { get; set; }
    public User User { get; set; } = null!;
}
