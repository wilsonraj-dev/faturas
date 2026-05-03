namespace Fatura.Server.Models;

public class ContaFinanceira
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoContaFinanceira Tipo { get; set; }
    public int InstituicaoId { get; set; }
    public int UserId { get; set; }

    public InstituicaoFinanceira Instituicao { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<LancamentoFinanceiro> Lancamentos { get; set; } = [];
}