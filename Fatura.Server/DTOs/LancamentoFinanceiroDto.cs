using Fatura.Server.Models;

namespace Fatura.Server.DTOs;

public class CriarLancamentoFinanceiroRequest
{
    public TipoCategoria Tipo { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string? Descricao { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
    public int ContaFinanceiraId { get; set; }
    public OrigemLancamento Origem { get; set; }
    public int? OrigemId { get; set; }
}

public class AtualizarLancamentoFinanceiroRequest
{
    public TipoCategoria Tipo { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string? Descricao { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
    public int ContaFinanceiraId { get; set; }
}

public class LancamentoFinanceiroResponse
{
    public int Id { get; set; }
    public TipoCategoria Tipo { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string? Descricao { get; set; }
    public int? CategoriaId { get; set; }
    public string? CategoriaNome { get; set; }
    public int? SubcategoriaId { get; set; }
    public string? SubcategoriaNome { get; set; }
    public int ContaFinanceiraId { get; set; }
    public string ContaFinanceiraNome { get; set; } = string.Empty;
    public OrigemLancamento Origem { get; set; }
    public int? OrigemId { get; set; }
}