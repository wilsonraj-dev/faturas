namespace Fatura.Server.Models;

public class InstituicaoFinanceira
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int UserId { get; set; }

    public User User { get; set; } = null!;
    public ICollection<ContaFinanceira> Contas { get; set; } = [];
}