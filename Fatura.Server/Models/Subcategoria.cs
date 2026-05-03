namespace Fatura.Server.Models;

public class Subcategoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
    public int UserId { get; set; }

    public Categoria Categoria { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<LancamentoFinanceiro> Lancamentos { get; set; } = [];
}