namespace Fatura.Server.DTOs;

public class CriarCompraRecorrenteRequest
{
    public string Nome { get; set; } = string.Empty;
    public decimal ValorMensal { get; set; }
    public int DiaCobranca { get; set; }
    public bool Ativo { get; set; } = true;
}

public class AtualizarCompraRecorrenteRequest
{
    public string Nome { get; set; } = string.Empty;
    public decimal ValorMensal { get; set; }
    public int DiaCobranca { get; set; }
    public bool Ativo { get; set; }
}

public class CompraRecorrenteResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal ValorMensal { get; set; }
    public int DiaCobranca { get; set; }
    public bool Ativo { get; set; }
}
