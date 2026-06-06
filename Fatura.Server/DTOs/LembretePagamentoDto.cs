using Fatura.Server.Models;

namespace Fatura.Server.DTOs;

public class CriarLembretePagamentoRequest
{
    public string NomeConta { get; set; } = string.Empty;
    public decimal ValorConta { get; set; }
    public int DiaVencimento { get; set; }
    public bool Ativo { get; set; } = true;
}

public class AtualizarLembretePagamentoRequest
{
    public string NomeConta { get; set; } = string.Empty;
    public decimal ValorConta { get; set; }
    public int DiaVencimento { get; set; }
    public bool Ativo { get; set; }
}

public class LembretePagamentoResponse
{
    public int Id { get; set; }
    public string NomeConta { get; set; } = string.Empty;
    public decimal ValorConta { get; set; }
    public int DiaVencimento { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
}

public class LembretePagamentoHistoricoResponse
{
    public int Id { get; set; }
    public int LembretePagamentoId { get; set; }
    public TipoLembreteEnvio TipoEnvio { get; set; }
    public CanalNotificacao Canal { get; set; }
    public DateTime DataReferencia { get; set; }
    public DateTime DataEnvio { get; set; }
}