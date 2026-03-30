namespace Fatura.Server.Models;

/// <summary>
/// Representa uma parcela individual de uma simulação.
/// </summary>
public class SimulacaoParcela
{
    public int Id { get; set; }
    public int SimulacaoId { get; set; }
    public int NumeroParcela { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }

    // Navegação
    public Simulacao Simulacao { get; set; } = null!;
}
