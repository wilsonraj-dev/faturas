using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IFornecedorService
{
    Task<List<FornecedorResponse>> ListarAsync(int userId);
    Task<FornecedorResponse?> ObterAsync(int id, int userId);
    Task<FornecedorResponse> CriarAsync(CriarFornecedorRequest request, int userId);
    Task<FornecedorResponse?> AtualizarAsync(int id, CriarFornecedorRequest request, int userId);
    Task<bool> DeletarAsync(int id, int userId);
}
