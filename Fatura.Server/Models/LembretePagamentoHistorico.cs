namespace Fatura.Server.Models;

public class LembretePagamentoHistorico
{
    public int Id { get; set; }
    public int LembretePagamentoId { get; set; }
    public TipoLembreteEnvio TipoEnvio { get; set; }
    public CanalNotificacao Canal { get; set; } = CanalNotificacao.Email;
    public DateTime DataReferencia { get; set; }
    public DateTime DataEnvio { get; set; }

    public LembretePagamento LembretePagamento { get; set; } = null!;
}