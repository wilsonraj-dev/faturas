using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface ICompraRecorrenteService
{
    Task<List<CompraRecorrenteResponse>> ListarAsync(int userId);
    Task<CompraRecorrenteResponse> CriarAsync(CriarCompraRecorrenteRequest request, int userId);
    Task<CompraRecorrenteResponse?> AtualizarAsync(int id, AtualizarCompraRecorrenteRequest request, int userId);
    Task<bool> DesativarAsync(int id, int userId);
    Task SincronizarComprasRecorrentesAsync(int userId);
}
