using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ICompraService
{
    Task<CompraResponse> CriarCompraAsync(CriarCompraRequest request, int userId);
    Task<SimulacaoResponse> SimularCompraAsync(CriarCompraRequest request);
    Task<bool> ContaFinanceiraExisteAsync(int contaFinanceiraId, int userId);
    Task<bool> CategoriaExisteAsync(int categoriaId, int userId);
    Task<bool> SubcategoriaExisteAsync(int subcategoriaId, int userId);
}
