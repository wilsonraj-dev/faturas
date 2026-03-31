using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ICompraService
{
    Task<CompraResponse> CriarCompraAsync(CriarCompraRequest request, int userId);
    Task<SimulacaoResponse> SimularCompraAsync(CriarCompraRequest request);
}
