namespace Fatura.Server.DTOs;

/// <summary>
/// DTO resumido de uma fatura (para listagem).
/// </summary>
public class FaturaResumoResponse
{
    public int Id { get; set; }
    public int Mes { get; set; }
    public int Ano { get; set; }
    public decimal ValorTotal { get; set; }
    public bool Quitada { get; set; }
    public int QuantidadeParcelas { get; set; }
    public double Orcamento { get; set; }
}

/// <summary>
/// DTO detalhado de uma fatura (com parcelas).
/// </summary>
public class FaturaDetalheResponse
{
    public int Id { get; set; }
    public int Mes { get; set; }
    public int Ano { get; set; }
    public decimal ValorTotal { get; set; }
    public bool Quitada { get; set; }
    public double Orcamento { get; set; }
    public List<ParcelaResponse> Parcelas { get; set; } = [];
}

/// <summary>
/// DTO para simulação de compra (sem persistir).
/// </summary>
public class SimulacaoResponse
{
    public List<SimulacaoFaturaItem> Faturas { get; set; } = [];
}

public class SimulacaoFaturaItem
{
    public int Mes { get; set; }
    public int Ano { get; set; }
    public decimal ValorParcela { get; set; }
}

/// <summary>
/// DTO para atualizar o orçamento de uma fatura.
/// </summary>
public class AtualizarOrcamentoRequest
{
    public double Orcamento { get; set; }
}
