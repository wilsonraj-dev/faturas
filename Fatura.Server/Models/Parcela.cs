namespace Fatura.Server.Models;

/// <summary>
/// Representa uma parcela individual de uma compra parcelada.
/// Cada parcela é vinculada a uma fatura (mês/ano).
/// </summary>
public class Parcela
{
    public int Id { get; set; }
    public int CompraId { get; set; }
    public int NumeroParcela { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public int? FaturaId { get; set; }

    // Navegação
    public Compra Compra { get; set; } = null!;
    public FaturaEntity? Fatura { get; set; }
}
