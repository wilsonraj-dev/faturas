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
    public int? ContaFinanceiraId { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
    public int UserId { get; set; }

    // Navegação: parcelas geradas automaticamente ao cadastrar a compra
    public List<Parcela> Parcelas { get; set; } = [];
    public Fornecedor? Fornecedor { get; set; }
    public ContaFinanceira? ContaFinanceira { get; set; }
    public Categoria? Categoria { get; set; }
    public Subcategoria? Subcategoria { get; set; }
    public User User { get; set; } = null!;
}
