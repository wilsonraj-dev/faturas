using Fatura.Server.Data;
using Fatura.Server.DTOs;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class FaturaService : IFaturaService
{
    private readonly AppDbContext _db;
    private readonly ICompraRecorrenteService _compraRecorrenteService;

    public FaturaService(AppDbContext db, ICompraRecorrenteService compraRecorrenteService)
    {
        _db = db;
        _compraRecorrenteService = compraRecorrenteService;
    }

    /// <summary>
    /// Lista todas as faturas de um determinado ano, ordenadas por mês.
    /// </summary>
    public async Task<List<FaturaResumoResponse>> ListarFaturasAsync(int ano, int userId)
    {
        await _compraRecorrenteService.SincronizarComprasRecorrentesAsync(userId);

        return await _db.Faturas
            .Where(f => f.Ano == ano && f.UserId == userId)
            .OrderBy(f => f.Mes)
            .Select(f => new FaturaResumoResponse
            {
                Id = f.Id,
                Mes = f.Mes,
                Ano = f.Ano,
                ValorTotal = f.ValorTotal,
                Quitada = f.Quitada,
                QuantidadeParcelas = f.Parcelas.Count,
                Orcamento = f.Orcamento
            })
            .ToListAsync();
    }

    /// <summary>
    /// Obtém os detalhes de uma fatura com todas as suas parcelas.
    /// </summary>
    public async Task<FaturaDetalheResponse?> ObterFaturaAsync(int id, int userId)
    {
        await _compraRecorrenteService.SincronizarComprasRecorrentesAsync(userId);

        var fatura = await _db.Faturas
            .Include(f => f.Parcelas)
                .ThenInclude(p => p.Compra!)
                    .ThenInclude(c => c.Fornecedor)
            .Include(f => f.Parcelas)
                .ThenInclude(p => p.CompraRecorrente)
            .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

        if (fatura is null) return null;

        return new FaturaDetalheResponse
        {
            Id = fatura.Id,
            Mes = fatura.Mes,
            Ano = fatura.Ano,
            ValorTotal = fatura.ValorTotal,
            Quitada = fatura.Quitada,
            Orcamento = fatura.Orcamento,
            Parcelas = fatura.Parcelas
                .OrderBy(p => p.Compra?.Nome ?? p.CompraRecorrente?.Nome ?? string.Empty)
                .ThenBy(p => p.NumeroParcela)
                .Select(p => new ParcelaResponse
                {
                    Id = p.Id,
                    CompraId = p.CompraId,
                    NomeCompra = p.Compra?.Nome ?? p.CompraRecorrente?.Nome ?? string.Empty,
                    Tipo = p.Tipo,
                    CompraRecorrenteId = p.CompraRecorrenteId,
                    NumeroParcela = p.NumeroParcela,
                    TotalParcelas = p.Tipo == Models.ParcelaTipo.Recorrente ? 1 : p.Compra?.NumeroParcelas ?? 1,
                    Valor = p.Valor,
                    DataVencimento = p.DataVencimento,
                    FornecedorNome = p.Compra?.Fornecedor != null ? p.Compra.Fornecedor.Nome : null
                }).ToList()
        };
    }

    /// <summary>
    /// Marca uma fatura como quitada.
    /// </summary>
    public async Task<bool> QuitarFaturaAsync(int id, int userId)
    {
        var fatura = await _db.Faturas.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        if (fatura is null) return false;

        fatura.Quitada = true;
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Reabre uma fatura previamente quitada.
    /// </summary>
    public async Task<bool> ReabrirFaturaAsync(int id, int userId)
    {
        var fatura = await _db.Faturas.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        if (fatura is null) return false;

        fatura.Quitada = false;
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Atualiza o orçamento de uma fatura.
    /// </summary>
    public async Task<bool> AtualizarOrcamentoAsync(int id, double orcamento, int userId)
    {
        var fatura = await _db.Faturas.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);
        if (fatura is null) return false;

        fatura.Orcamento = orcamento;
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Retorna dados para o dashboard: faturas do ano com totais.
    /// </summary>
    public async Task<List<FaturaResumoResponse>> ObterDashboardAsync(int ano, int userId)
    {
        return await ListarFaturasAsync(ano, userId);
    }

    /// <summary>
    /// Exporta as faturas para um arquivo Excel (.xlsx).
    /// </summary>
    public async Task<byte[]> ExportarExcelAsync(int? ano, int userId)
    {
        await _compraRecorrenteService.SincronizarComprasRecorrentesAsync(userId);

        var query = _db.Parcelas
            .Where(p => p.UserId == userId)
            .Include(p => p.Compra!)
                .ThenInclude(c => c.Fornecedor)
            .Include(p => p.CompraRecorrente)
            .Include(p => p.Fatura)
            .AsQueryable();

        if (ano.HasValue)
        {
            query = query.Where(p => p.Fatura != null && p.Fatura.Ano == ano.Value);
        }

        var parcelas = await query
            .OrderBy(p => p.Fatura!.Ano)
            .ThenBy(p => p.Fatura!.Mes)
            .ThenBy(p => p.Compra != null ? p.Compra.Nome : p.CompraRecorrente!.Nome)
            .ThenBy(p => p.NumeroParcela)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Faturas");

        // Cabeçalhos
        worksheet.Cell(1, 1).Value = "Mês/Ano";
        worksheet.Cell(1, 2).Value = "Compra";
        worksheet.Cell(1, 3).Value = "Parcela";
        worksheet.Cell(1, 4).Value = "Valor (R$)";
        worksheet.Cell(1, 5).Value = "Fornecedor";
        worksheet.Cell(1, 6).Value = "Status Fatura";

        var headerRange = worksheet.Range(1, 1, 1, 6);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#3f51b5");
        headerRange.Style.Font.FontColor = XLColor.White;

        // Dados
        var row = 2;
        foreach (var parcela in parcelas)
        {
            var mesAno = parcela.Fatura != null
                ? $"{parcela.Fatura.Mes:D2}/{parcela.Fatura.Ano}"
                : parcela.DataVencimento.ToString("MM/yyyy");
            var nomeCompra = parcela.Compra?.Nome ?? parcela.CompraRecorrente?.Nome ?? string.Empty;
            var totalParcelas = parcela.Tipo == Models.ParcelaTipo.Recorrente ? 1 : parcela.Compra?.NumeroParcelas ?? 1;

            worksheet.Cell(row, 1).Value = mesAno;
            worksheet.Cell(row, 2).Value = nomeCompra;
            worksheet.Cell(row, 3).Value = $"{parcela.NumeroParcela}/{totalParcelas}";
            worksheet.Cell(row, 4).Value = parcela.Valor;
            worksheet.Cell(row, 4).Style.NumberFormat.Format = "#,##0.00";
            worksheet.Cell(row, 5).Value = parcela.Compra?.Fornecedor?.Nome ?? "";
            worksheet.Cell(row, 6).Value = parcela.Fatura?.Quitada == true ? "Quitada" : "Em aberto";
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
