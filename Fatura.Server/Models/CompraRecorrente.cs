namespace Fatura.Server.Models;

public class CompraRecorrente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal ValorMensal { get; set; }
    public int DiaCobranca { get; set; }
    public bool Ativo { get; set; } = true;
    public int UserId { get; set; }

    public User User { get; set; } = null!;
    public List<Parcela> Parcelas { get; set; } = [];
}
