namespace Fatura.Server.DTOs;

using Fatura.Server.Models;

/// <summary>
/// DTO para criação de uma nova compra parcelada.
/// </summary>
public class CriarCompraRequest
{
    public string Nome { get; set; } = string.Empty;
    public DateTime DataCompra { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
    public int? FornecedorId { get; set; }
}

/// <summary>
/// DTO de resposta ao criar uma compra.
/// </summary>
public class CompraResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime DataCompra { get; set; }
    public int NumeroParcelas { get; set; }
    public decimal ValorTotal { get; set; }
    public int? FornecedorId { get; set; }
    public string? FornecedorNome { get; set; }
    public List<ParcelaResponse> Parcelas { get; set; } = [];
}

/// <summary>
/// DTO de uma parcela individual.
/// </summary>
public class ParcelaResponse
{
    public int Id { get; set; }
    public string NomeCompra { get; set; } = string.Empty;
    public ParcelaTipo Tipo { get; set; }
    public int? CompraRecorrenteId { get; set; }
    public int NumeroParcela { get; set; }
    public int TotalParcelas { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public string? FornecedorNome { get; set; }
}
