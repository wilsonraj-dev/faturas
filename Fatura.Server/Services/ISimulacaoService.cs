using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ISimulacaoService
{
    Task<List<SimulacaoResumoResponse>> ListarAsync();
    Task<SimulacaoDetalheResponse?> ObterAsync(int id);
    Task<SimulacaoDetalheResponse> CriarAsync(CriarSimulacaoRequest request);
    Task<bool> DeletarAsync(int id);
    Task<CompraResponse?> ConverterEmCompraAsync(int simulacaoId);
}
