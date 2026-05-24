namespace Fatura.Server.Models;

/// <summary>
/// Representa uma simulação de compra parcelada (não persiste como compra real).
/// </summary>
public class Simulacao
{
    public int Id { get; set; }
    public string? Nome { get; set; }
    public DateTime DataSimulacao { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
    public int? ContaFinanceiraId { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
    public int UserId { get; set; }

    // Navegação: parcelas da simulação
    public List<SimulacaoParcela> Parcelas { get; set; } = [];
    public ContaFinanceira? ContaFinanceira { get; set; }
    public Categoria? Categoria { get; set; }
    public Subcategoria? Subcategoria { get; set; }
    public User User { get; set; } = null!;
}
