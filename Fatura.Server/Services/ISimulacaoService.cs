using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ISimulacaoService
{
    Task<List<SimulacaoResumoResponse>> ListarAsync(int userId);
    Task<SimulacaoDetalheResponse?> ObterAsync(int id, int userId);
    Task<SimulacaoDetalheResponse> CriarAsync(CriarSimulacaoRequest request, int userId);
    Task<bool> DeletarAsync(int id, int userId);
    Task<CompraResponse?> ConverterEmCompraAsync(int simulacaoId, int userId);
    Task<bool> ContaFinanceiraExisteAsync(int contaFinanceiraId, int userId);
    Task<bool> CategoriaExisteAsync(int categoriaId, int userId);
    Task<bool> SubcategoriaExisteAsync(int subcategoriaId, int userId);
}
