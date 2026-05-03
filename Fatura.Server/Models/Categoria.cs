namespace Fatura.Server.Models;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoCategoria Tipo { get; set; }
    public int UserId { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Subcategoria> Subcategorias { get; set; } = [];
    public ICollection<LancamentoFinanceiro> Lancamentos { get; set; } = [];
}