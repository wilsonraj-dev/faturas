namespace Fatura.Server.Models;

public class CompraRecorrente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal ValorMensal { get; set; }
    public int DiaCobranca { get; set; }
    public bool Ativo { get; set; } = true;
    public int? ContaFinanceiraId { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
    public int UserId { get; set; }

    public ContaFinanceira? ContaFinanceira { get; set; }
    public Categoria? Categoria { get; set; }
    public Subcategoria? Subcategoria { get; set; }
    public User User { get; set; } = null!;
    public List<Parcela> Parcelas { get; set; } = [];
}
