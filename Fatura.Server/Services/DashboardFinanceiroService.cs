using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class DashboardFinanceiroService : IDashboardFinanceiroService
{
    private readonly AppDbContext _db;

    public DashboardFinanceiroService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardFinanceiroResumoResponse> ObterResumoAsync(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        var query = AplicarFiltros(userId, filtro);

        var resumo = await query
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalRecebido = g.Sum(l => l.Tipo == TipoCategoria.Receita ? l.Valor : 0),
                TotalGasto = g.Sum(l => l.Tipo == TipoCategoria.Despesa ? l.Valor : 0),
                QuantidadeLancamentos = g.Count(),
                QuantidadeReceitas = g.Sum(l => l.Tipo == TipoCategoria.Receita ? 1 : 0),
                QuantidadeDespesas = g.Sum(l => l.Tipo == TipoCategoria.Despesa ? 1 : 0)
            })
            .FirstOrDefaultAsync();

        var maiorDespesa = await query
            .Where(l => l.Tipo == TipoCategoria.Despesa)
            .OrderByDescending(l => l.Valor)
            .Select(l => new { l.Valor, l.Descricao, Subcategoria = l.Subcategoria != null ? l.Subcategoria.Nome : null })
            .FirstOrDefaultAsync();

        var totalRecebido = resumo?.TotalRecebido ?? 0;
        var totalGasto = resumo?.TotalGasto ?? 0;
        var quantidadeReceitas = resumo?.QuantidadeReceitas ?? 0;
        var quantidadeDespesas = resumo?.QuantidadeDespesas ?? 0;

        return new DashboardFinanceiroResumoResponse
        {
            TotalRecebido = totalRecebido,
            TotalGasto = totalGasto,
            Saldo = totalRecebido - totalGasto,
            PercentualReceitaComprometida = totalRecebido > 0 ? Math.Round((totalGasto / totalRecebido) * 100, 2) : 0,
            TicketMedioDespesas = quantidadeDespesas > 0 ? Math.Round(totalGasto / quantidadeDespesas, 2) : 0,
            TicketMedioReceitas = quantidadeReceitas > 0 ? Math.Round(totalRecebido / quantidadeReceitas, 2) : 0,
            QuantidadeLancamentos = resumo?.QuantidadeLancamentos ?? 0,
            MaiorDespesaValor = maiorDespesa?.Valor ?? 0,
            MaiorDespesaDescricao = maiorDespesa?.Subcategoria ?? maiorDespesa?.Descricao
        };
    }

    public async Task<List<DashboardFinanceiroSerieMensalItem>> ObterReceitaDespesaAsync(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        var dados = await AplicarFiltros(userId, filtro)
            .GroupBy(l => new { l.Data.Year, l.Data.Month })
            .Select(g => new DashboardFinanceiroSerieMensalItem
            {
                Ano = g.Key.Year,
                Mes = g.Key.Month,
                Receitas = g.Sum(l => l.Tipo == TipoCategoria.Receita ? l.Valor : 0),
                Despesas = g.Sum(l => l.Tipo == TipoCategoria.Despesa ? l.Valor : 0)
            })
            .OrderBy(item => item.Ano)
            .ThenBy(item => item.Mes)
            .ToListAsync();

        foreach (var item in dados)
        {
            item.Label = FormatarMes(item.Ano, item.Mes);
            item.Saldo = item.Receitas - item.Despesas;
        }

        return dados;
    }

    public async Task<List<DashboardFinanceiroAgrupamentoItem>> ObterCategoriasAsync(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        var dados = await AplicarFiltros(userId, filtro)
            .Where(l => l.Tipo == TipoCategoria.Despesa)
            .GroupBy(l => new
            {
                l.CategoriaId,
                Nome = l.Categoria != null ? l.Categoria.Nome : "Sem categoria"
            })
            .Select(g => new DashboardFinanceiroAgrupamentoItem
            {
                Id = g.Key.CategoriaId,
                Nome = g.Key.Nome,
                Valor = g.Sum(l => l.Valor)
            })
            .OrderByDescending(item => item.Valor)
            .ToListAsync();

        AplicarPercentuais(dados);
        return dados;
    }

    public async Task<List<DashboardFinanceiroAgrupamentoItem>> ObterSubcategoriasAsync(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        var dados = await AplicarFiltros(userId, filtro)
            .Where(l => l.Tipo == TipoCategoria.Despesa)
            .GroupBy(l => new
            {
                l.SubcategoriaId,
                Nome = l.Subcategoria != null ? l.Subcategoria.Nome : "Sem subcategoria"
            })
            .Select(g => new DashboardFinanceiroAgrupamentoItem
            {
                Id = g.Key.SubcategoriaId,
                Nome = g.Key.Nome,
                Valor = g.Sum(l => l.Valor)
            })
            .OrderByDescending(item => item.Valor)
            .ToListAsync();

        AplicarPercentuais(dados);
        return dados;
    }

    public async Task<List<DashboardFinanceiroSerieMensalItem>> ObterEvolucaoAsync(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        return await ObterReceitaDespesaAsync(userId, filtro);
    }

    public async Task<DashboardFinanceiroComparativoResponse> ObterComparativoAsync(int userId, DashboardFinanceiroComparativoRequest request)
    {
        var periodoA = await ObterResumoPeriodoAsync(userId, request.PeriodoAInicial, request.PeriodoAFinal, request);
        var periodoB = await ObterResumoPeriodoAsync(userId, request.PeriodoBInicial, request.PeriodoBFinal, request);

        return new DashboardFinanceiroComparativoResponse
        {
            PeriodoA = periodoA,
            PeriodoB = periodoB,
            VariacaoReceitaPercentual = CalcularVariacao(periodoA.Receita, periodoB.Receita),
            VariacaoDespesaPercentual = CalcularVariacao(periodoA.Despesa, periodoB.Despesa),
            VariacaoSaldoPercentual = CalcularVariacao(periodoA.Saldo, periodoB.Saldo)
        };
    }

    public async Task<DashboardFinanceiroRankingsResponse> ObterRankingsAsync(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        var categorias = await ObterCategoriasAsync(userId, filtro);
        var subcategorias = await ObterSubcategoriasAsync(userId, filtro);

        return new DashboardFinanceiroRankingsResponse
        {
            MaioresCategorias = categorias.Take(5).ToList(),
            MaioresSubcategorias = subcategorias.Take(5).ToList()
        };
    }

    private IQueryable<LancamentoFinanceiro> AplicarFiltros(int userId, DashboardFinanceiroFiltroRequest filtro)
    {
        var query = _db.LancamentosFinanceiros
            .AsNoTracking()
            .Where(l => l.UserId == userId);

        if (filtro.DataInicial.HasValue)
        {
            var inicio = filtro.DataInicial.Value.Date;
            query = query.Where(l => l.Data >= inicio);
        }

        if (filtro.DataFinal.HasValue)
        {
            var fim = filtro.DataFinal.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(l => l.Data <= fim);
        }

        if (filtro.ContaFinanceiraId.HasValue)
        {
            query = query.Where(l => l.ContaFinanceiraId == filtro.ContaFinanceiraId.Value);
        }

        if (filtro.CategoriaId.HasValue)
        {
            query = query.Where(l => l.CategoriaId == filtro.CategoriaId.Value);
        }

        if (filtro.SubcategoriaId.HasValue)
        {
            query = query.Where(l => l.SubcategoriaId == filtro.SubcategoriaId.Value);
        }

        return query;
    }

    private async Task<DashboardFinanceiroPeriodoResumo> ObterResumoPeriodoAsync(
        int userId,
        DateTime dataInicial,
        DateTime dataFinal,
        DashboardFinanceiroComparativoRequest request)
    {
        var filtro = new DashboardFinanceiroFiltroRequest
        {
            DataInicial = dataInicial,
            DataFinal = dataFinal,
            ContaFinanceiraId = request.ContaFinanceiraId,
            CategoriaId = request.CategoriaId,
            SubcategoriaId = request.SubcategoriaId
        };

        var resumo = await AplicarFiltros(userId, filtro)
            .GroupBy(_ => 1)
            .Select(g => new DashboardFinanceiroPeriodoResumo
            {
                Receita = g.Sum(l => l.Tipo == TipoCategoria.Receita ? l.Valor : 0),
                Despesa = g.Sum(l => l.Tipo == TipoCategoria.Despesa ? l.Valor : 0)
            })
            .FirstOrDefaultAsync() ?? new DashboardFinanceiroPeriodoResumo();

        resumo.Saldo = resumo.Receita - resumo.Despesa;
        return resumo;
    }

    private static void AplicarPercentuais(List<DashboardFinanceiroAgrupamentoItem> dados)
    {
        var total = dados.Sum(item => item.Valor);
        foreach (var item in dados)
        {
            item.Percentual = total > 0 ? Math.Round((item.Valor / total) * 100, 2) : 0;
        }
    }

    private static decimal CalcularVariacao(decimal valorA, decimal valorB)
    {
        if (valorA == 0)
        {
            return valorB == 0 ? 0 : 100;
        }

        return Math.Round(((valorB - valorA) / Math.Abs(valorA)) * 100, 2);
    }

    private static string FormatarMes(int ano, int mes)
    {
        return $"{mes:00}/{ano}";
    }
}
