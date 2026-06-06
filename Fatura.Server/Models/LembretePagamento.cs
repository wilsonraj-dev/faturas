namespace Fatura.Server.Models;

public class LembretePagamento
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string NomeConta { get; set; } = string.Empty;
    public decimal ValorConta { get; set; }
    public int DiaVencimento { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }

    public User User { get; set; } = null!;
    public List<LembretePagamentoHistorico> Historicos { get; set; } = [];
}