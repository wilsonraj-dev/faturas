namespace Fatura.Server.DTOs;

/// <summary>
/// DTO para criação de uma simulação persistida.
/// </summary>
public class CriarSimulacaoRequest
{
    public string? Nome { get; set; }
    public DateTime DataSimulacao { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
}

/// <summary>
/// DTO de resposta de uma simulação.
/// </summary>
public class SimulacaoDetalheResponse
{
    public int Id { get; set; }
    public string? Nome { get; set; }
    public DateTime DataSimulacao { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
    public List<SimulacaoParcelaResponse> Parcelas { get; set; } = [];
}

/// <summary>
/// DTO de uma parcela de simulação.
/// </summary>
public class SimulacaoParcelaResponse
{
    public int Id { get; set; }
    public int NumeroParcela { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public int Mes { get; set; }
    public int Ano { get; set; }
}

/// <summary>
/// DTO resumido de uma simulação (para listagem).
/// </summary>
public class SimulacaoResumoResponse
{
    public int Id { get; set; }
    public string? Nome { get; set; }
    public DateTime DataSimulacao { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
}
