namespace Fatura.Server.Services;

public interface ILembretePagamentoProcessamentoService
{
    Task ProcessarAsync(DateTime? dataAtual = null, CancellationToken cancellationToken = default);
}