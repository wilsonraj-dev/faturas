namespace Fatura.Server.Models;

public class LancamentoFinanceiro
{
    public int Id { get; set; }
    public TipoCategoria Tipo { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string? Descricao { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
    public int ContaFinanceiraId { get; set; }
    public OrigemLancamento Origem { get; set; }
    public int? OrigemId { get; set; }
    public int UserId { get; set; }

    public Categoria? Categoria { get; set; }
    public Subcategoria? Subcategoria { get; set; }
    public ContaFinanceira ContaFinanceira { get; set; } = null!;
    public User User { get; set; } = null!;
}