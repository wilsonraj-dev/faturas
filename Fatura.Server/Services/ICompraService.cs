using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ICompraService
{
    Task<CompraResponse> CriarCompraAsync(CriarCompraRequest request);
    Task<SimulacaoResponse> SimularCompraAsync(CriarCompraRequest request);
}
