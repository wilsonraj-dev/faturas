namespace Fatura.Server.DTOs;

public class DashboardFinanceiroFiltroRequest
{
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public int? ContaFinanceiraId { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
}

public class DashboardFinanceiroComparativoRequest
{
    public DateTime PeriodoAInicial { get; set; }
    public DateTime PeriodoAFinal { get; set; }
    public DateTime PeriodoBInicial { get; set; }
    public DateTime PeriodoBFinal { get; set; }
    public int? ContaFinanceiraId { get; set; }
    public int? CategoriaId { get; set; }
    public int? SubcategoriaId { get; set; }
}

public class DashboardFinanceiroResumoResponse
{
    public decimal TotalRecebido { get; set; }
    public decimal TotalGasto { get; set; }
    public decimal Saldo { get; set; }
    public decimal PercentualReceitaComprometida { get; set; }
    public decimal TicketMedioDespesas { get; set; }
    public decimal TicketMedioReceitas { get; set; }
    public int QuantidadeLancamentos { get; set; }
    public decimal MaiorDespesaValor { get; set; }
    public string? MaiorDespesaDescricao { get; set; }
}

public class DashboardFinanceiroSerieMensalItem
{
    public int Ano { get; set; }
    public int Mes { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Receitas { get; set; }
    public decimal Despesas { get; set; }
    public decimal Saldo { get; set; }
}

public class DashboardFinanceiroAgrupamentoItem
{
    public int? Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public decimal Percentual { get; set; }
}

public class DashboardFinanceiroPeriodoResumo
{
    public decimal Receita { get; set; }
    public decimal Despesa { get; set; }
    public decimal Saldo { get; set; }
}

public class DashboardFinanceiroComparativoResponse
{
    public DashboardFinanceiroPeriodoResumo PeriodoA { get; set; } = new();
    public DashboardFinanceiroPeriodoResumo PeriodoB { get; set; } = new();
    public decimal VariacaoReceitaPercentual { get; set; }
    public decimal VariacaoDespesaPercentual { get; set; }
    public decimal VariacaoSaldoPercentual { get; set; }
}

public class DashboardFinanceiroRankingsResponse
{
    public List<DashboardFinanceiroAgrupamentoItem> MaioresCategorias { get; set; } = [];
    public List<DashboardFinanceiroAgrupamentoItem> MaioresSubcategorias { get; set; } = [];
}
