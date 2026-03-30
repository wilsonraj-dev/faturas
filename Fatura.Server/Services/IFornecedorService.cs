using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IFornecedorService
{
    Task<List<FornecedorResponse>> ListarAsync();
    Task<FornecedorResponse?> ObterAsync(int id);
    Task<FornecedorResponse> CriarAsync(CriarFornecedorRequest request);
    Task<FornecedorResponse?> AtualizarAsync(int id, CriarFornecedorRequest request);
    Task<bool> DeletarAsync(int id);
}
