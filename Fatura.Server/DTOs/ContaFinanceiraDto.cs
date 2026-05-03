using Fatura.Server.Models;

namespace Fatura.Server.DTOs;

public class CriarContaFinanceiraRequest
{
    public string Nome { get; set; } = string.Empty;
    public TipoContaFinanceira Tipo { get; set; }
    public int InstituicaoId { get; set; }
}

public class AtualizarContaFinanceiraRequest
{
    public string Nome { get; set; } = string.Empty;
    public TipoContaFinanceira Tipo { get; set; }
    public int InstituicaoId { get; set; }
}

public class ContaFinanceiraResumoResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoContaFinanceira Tipo { get; set; }
}

public class ContaFinanceiraResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoContaFinanceira Tipo { get; set; }
    public int InstituicaoId { get; set; }
    public string InstituicaoNome { get; set; } = string.Empty;
}