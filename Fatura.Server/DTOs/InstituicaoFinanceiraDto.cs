using Fatura.Server.Models;

namespace Fatura.Server.DTOs;

public class CriarInstituicaoFinanceiraRequest
{
    public string Nome { get; set; } = string.Empty;
}

public class AtualizarInstituicaoFinanceiraRequest
{
    public string Nome { get; set; } = string.Empty;
}

public class InstituicaoFinanceiraResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int QuantidadeContas { get; set; }
}

public class InstituicaoFinanceiraDetalheResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public List<ContaFinanceiraResumoResponse> Contas { get; set; } = [];
}