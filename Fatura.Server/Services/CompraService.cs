using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class CompraService : ICompraService
{
    private readonly AppDbContext _db;

    public CompraService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Cria uma compra e gera automaticamente as parcelas,
    /// vinculando cada uma à fatura correspondente (mês/ano).
    /// </summary>
    public async Task<CompraResponse> CriarCompraAsync(CriarCompraRequest request, int userId)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        // Calcula o valor de cada parcela (divisão igualitária)
        var valorParcela = Math.Round(request.ValorTotal / request.NumeroParcelas, 2);

        // Ajusta a última parcela para compensar diferenças de arredondamento
        var valorUltimaParcela = request.ValorTotal - (valorParcela * (request.NumeroParcelas - 1));

        var compra = new Compra
        {
            Nome = request.Nome,
            DataCompra = request.DataCompra,
            NumeroParcelas = request.NumeroParcelas,
            ValorTotal = request.ValorTotal,
            FornecedorId = request.FornecedorId,
            ContaFinanceiraId = request.ContaFinanceiraId,
            CategoriaId = request.CategoriaId,
            SubcategoriaId = request.SubcategoriaId,
            UserId = userId
        };

        _db.Compras.Add(compra);
        await _db.SaveChangesAsync();

        // Gera as parcelas mês a mês a partir do mês seguinte à data da compra
        for (int i = 0; i < request.NumeroParcelas; i++)
        {
            var dataVencimento = request.DataCompra.AddMonths(i + 1);
            var valor = (i == request.NumeroParcelas - 1) ? valorUltimaParcela : valorParcela;

            // Busca ou cria a fatura do mês/ano correspondente
            var fatura = await ObterOuCriarFaturaAsync(dataVencimento.Month, dataVencimento.Year, userId);

            var parcela = new Parcela
            {
                CompraId = compra.Id,
                Tipo = ParcelaTipo.Normal,
                NumeroParcela = i + 1,
                Valor = valor,
                DataVencimento = dataVencimento,
                FaturaId = fatura.Id,
                UserId = userId
            };

            _db.Parcelas.Add(parcela);
        }

        await _db.SaveChangesAsync();

        // Recalcula o valor total de cada fatura afetada
        await RecalcularFaturasAsync(compra.Id);
        await transaction.CommitAsync();

        return (await ObterCompraAsync(compra.Id, userId))!;
    }

    public async Task<CompraResponse?> ObterCompraAsync(int id, int userId)
    {
        var compra = await _db.Compras.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (compra is null) return null;

        // Retorna a compra com suas parcelas
        var parcelas = await _db.Parcelas
            .Where(p => p.CompraId == compra.Id && p.UserId == userId)
            .OrderBy(p => p.NumeroParcela)
            .ToListAsync();

        // Carrega fornecedor se existir
        string? fornecedorNome = null;
        string? categoriaNome = null;
        string? subcategoriaNome = null;

        if (compra.FornecedorId.HasValue)
        {
            var fornecedor = await _db.Fornecedores.FindAsync(compra.FornecedorId.Value);
            fornecedorNome = fornecedor?.Nome;
        }

        if (compra.CategoriaId.HasValue)
        {
            var categoria = await _db.Categorias.FindAsync(compra.CategoriaId.Value);
            categoriaNome = categoria?.Nome;
        }

        if (compra.SubcategoriaId.HasValue)
        {
            var subcategoria = await _db.Subcategorias.FindAsync(compra.SubcategoriaId.Value);
            subcategoriaNome = subcategoria?.Nome;
        }

        return new CompraResponse
        {
            Id = compra.Id,
            Nome = compra.Nome,
            DataCompra = compra.DataCompra,
            NumeroParcelas = compra.NumeroParcelas,
            ValorTotal = compra.ValorTotal,
            FornecedorId = compra.FornecedorId,
            FornecedorNome = fornecedorNome,
            ContaFinanceiraId = compra.ContaFinanceiraId,
            CategoriaId = compra.CategoriaId,
            CategoriaNome = categoriaNome,
            SubcategoriaId = compra.SubcategoriaId,
            SubcategoriaNome = subcategoriaNome,
            Parcelas = parcelas.Select(p => new ParcelaResponse
            {
                Id = p.Id,
                CompraId = p.CompraId,
                NomeCompra = compra.Nome,
                Tipo = p.Tipo,
                CompraRecorrenteId = p.CompraRecorrenteId,
                NumeroParcela = p.NumeroParcela,
                TotalParcelas = compra.NumeroParcelas,
                Valor = p.Valor,
                DataVencimento = p.DataVencimento,
                FornecedorNome = fornecedorNome
            }).ToList()
        };
    }

    public async Task<ServiceResult<CompraResponse>> AtualizarCompraAsync(int id, CriarCompraRequest request, int userId)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        var compra = await _db.Compras.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (compra is null) return ServiceResult<CompraResponse>.NotFoundResult("Compra não encontrada.");

        var parcelasAntigas = await _db.Parcelas
            .Where(p => p.CompraId == id && p.UserId == userId)
            .Include(p => p.Fatura)
            .ToListAsync();

        if (parcelasAntigas.Any(p => p.Fatura?.Quitada == true))
            return ServiceResult<CompraResponse>.Invalid("Reabra todas as faturas quitadas desta compra antes de editá-la.");

        var novasDatas = Enumerable.Range(1, request.NumeroParcelas)
            .Select(numero => request.DataCompra.AddMonths(numero)).ToList();
        
        var anosDestino = novasDatas.Select(d => d.Year).Distinct().ToList();
        var faturasDestino = await _db.Faturas
            .Where(f => f.UserId == userId && anosDestino.Contains(f.Ano))
            .ToListAsync();

        if (faturasDestino.Any(f => f.Quitada && novasDatas.Any(d => d.Year == f.Ano && d.Month == f.Mes)))
            return ServiceResult<CompraResponse>.Invalid("Reabra as faturas de destino quitadas antes de editar esta compra.");

        var faturaIdsAfetadas = parcelasAntigas.Where(p => p.FaturaId.HasValue)
            .Select(p => p.FaturaId!.Value).ToHashSet();
        await RemoverLancamentosDasParcelasAsync(parcelasAntigas, userId);
        _db.Parcelas.RemoveRange(parcelasAntigas);
        await _db.SaveChangesAsync();

        compra.Nome = request.Nome.Trim();
        compra.DataCompra = request.DataCompra;
        compra.NumeroParcelas = request.NumeroParcelas;
        compra.ValorTotal = request.ValorTotal;
        compra.FornecedorId = request.FornecedorId;
        compra.ContaFinanceiraId = request.ContaFinanceiraId;
        compra.CategoriaId = request.CategoriaId;
        compra.SubcategoriaId = request.SubcategoriaId;

        var valorParcela = Math.Round(request.ValorTotal / request.NumeroParcelas, 2);
        for (var i = 0; i < novasDatas.Count; i++)
        {
            var data = novasDatas[i];
            var fatura = await ObterOuCriarFaturaAsync(data.Month, data.Year, userId);
            faturaIdsAfetadas.Add(fatura.Id);
            _db.Parcelas.Add(new Parcela
            {
                CompraId = compra.Id,
                Tipo = ParcelaTipo.Normal,
                NumeroParcela = i + 1,
                Valor = i == novasDatas.Count - 1
                    ? request.ValorTotal - valorParcela * (novasDatas.Count - 1)
                    : valorParcela,
                DataVencimento = data,
                FaturaId = fatura.Id,
                UserId = userId
            });
        }

        await _db.SaveChangesAsync();
        await RecalcularFaturasAsync(faturaIdsAfetadas);
        await transaction.CommitAsync();
        return ServiceResult<CompraResponse>.Ok((await ObterCompraAsync(id, userId))!);
    }

    public async Task<ServiceResult> RemoverCompraAsync(int id, int userId)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        var compra = await _db.Compras.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (compra is null) return ServiceResult.NotFoundResult("Compra não encontrada.");

        var parcelas = await _db.Parcelas
            .Where(p => p.CompraId == id && p.UserId == userId)
            .Include(p => p.Fatura)
            .ToListAsync();
        if (parcelas.Any(p => p.Fatura?.Quitada == true))
            return ServiceResult.Invalid("Reabra todas as faturas quitadas desta compra antes de removê-la.");

        var faturaIdsAfetadas = parcelas.Where(p => p.FaturaId.HasValue)
            .Select(p => p.FaturaId!.Value).Distinct().ToList();
        await RemoverLancamentosDasParcelasAsync(parcelas, userId);
        _db.Parcelas.RemoveRange(parcelas);
        _db.Compras.Remove(compra);
        await _db.SaveChangesAsync();
        await RecalcularFaturasAsync(faturaIdsAfetadas);
        await transaction.CommitAsync();
        return ServiceResult.Ok();
    }

    /// <summary>
    /// Simula a distribuição de parcelas nas faturas sem persistir no banco.
    /// </summary>
    public Task<SimulacaoResponse> SimularCompraAsync(CriarCompraRequest request)
    {
        var valorParcela = Math.Round(request.ValorTotal / request.NumeroParcelas, 2);
        var valorUltimaParcela = request.ValorTotal - (valorParcela * (request.NumeroParcelas - 1));

        var faturas = new List<SimulacaoFaturaItem>();

        for (int i = 0; i < request.NumeroParcelas; i++)
        {
            var data = request.DataCompra.AddMonths(i + 1);
            faturas.Add(new SimulacaoFaturaItem
            {
                Mes = data.Month,
                Ano = data.Year,
                ValorParcela = (i == request.NumeroParcelas - 1) ? valorUltimaParcela : valorParcela
            });
        }

        return Task.FromResult(new SimulacaoResponse { Faturas = faturas });
    }

    public Task<bool> ContaFinanceiraExisteAsync(int contaFinanceiraId, int userId)
        => _db.ContasFinanceiras.AnyAsync(c => c.Id == contaFinanceiraId && c.UserId == userId);

    public Task<bool> CategoriaExisteAsync(int categoriaId, int userId)
        => _db.Categorias.AnyAsync(c => c.Id == categoriaId && c.UserId == userId);

    public Task<bool> SubcategoriaExisteAsync(int subcategoriaId, int userId)
        => _db.Subcategorias.AnyAsync(s => s.Id == subcategoriaId && s.UserId == userId);

    /// <summary>
    /// Busca uma fatura existente para o mês/ano ou cria uma nova.
    /// </summary>
    private async Task<FaturaEntity> ObterOuCriarFaturaAsync(int mes, int ano, int userId)
    {
        var fatura = await _db.Faturas.FirstOrDefaultAsync(f => f.Mes == mes && f.Ano == ano && f.UserId == userId);

        if (fatura is null)
        {
            fatura = new FaturaEntity
            {
                Mes = mes,
                Ano = ano,
                ValorTotal = 0,
                Quitada = false,
                UserId = userId
            };
            _db.Faturas.Add(fatura);
            await _db.SaveChangesAsync();
        }

        return fatura;
    }

    /// <summary>
    /// Recalcula o valor total de todas as faturas vinculadas a uma compra.
    /// </summary>
    private async Task RecalcularFaturasAsync(int compraId)
    {
        var faturaIds = await _db.Parcelas
            .Where(p => p.CompraId == compraId && p.FaturaId != null)
            .Select(p => p.FaturaId!.Value)
            .Distinct()
            .ToListAsync();

        await RecalcularFaturasAsync(faturaIds);
    }

    private async Task RecalcularFaturasAsync(IEnumerable<int> faturaIds)
    {
        foreach (var faturaId in faturaIds)
        {
            var valores = await _db.Parcelas
                .Where(p => p.FaturaId == faturaId)
                .Select(p => p.Valor)
                .ToListAsync();
            var total = valores.Sum();

            var fatura = await _db.Faturas.FindAsync(faturaId);
            if (fatura is not null)
            {
                fatura.ValorTotal = total;
            }
        }

        await _db.SaveChangesAsync();
    }

    private async Task RemoverLancamentosDasParcelasAsync(IEnumerable<Parcela> parcelas, int userId)
    {
        var parcelaIds = parcelas.Select(p => p.Id).ToList();
        var lancamentos = await _db.LancamentosFinanceiros
            .Where(l => l.UserId == userId && l.Origem == OrigemLancamento.Fatura
                && l.OrigemId.HasValue && parcelaIds.Contains(l.OrigemId.Value))
            .ToListAsync();
        _db.LancamentosFinanceiros.RemoveRange(lancamentos);
    }
}
