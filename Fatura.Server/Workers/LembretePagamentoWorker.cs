using Fatura.Server.Services;

namespace Fatura.Server.Workers;

public class LembretePagamentoWorker : BackgroundService
{
    private static readonly TimeSpan HorarioExecucao = TimeSpan.FromHours(8);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LembretePagamentoWorker> _logger;

    public LembretePagamentoWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<LembretePagamentoWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var processamentoService = scope.ServiceProvider.GetRequiredService<ILembretePagamentoProcessamentoService>();
                await processamentoService.ProcessarAsync(cancellationToken: stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao executar o worker de lembretes de pagamento.");
            }

            var proximaExecucao = CalcularProximaExecucao(DateTime.Now);
            var atraso = proximaExecucao - DateTime.Now;

            if (atraso < TimeSpan.Zero)
            {
                atraso = TimeSpan.FromMinutes(1);
            }

            await Task.Delay(atraso, stoppingToken);
        }
    }

    private static DateTime CalcularProximaExecucao(DateTime agora)
    {
        var hojeAsOito = agora.Date.Add(HorarioExecucao);
        return agora < hojeAsOito
            ? hojeAsOito
            : hojeAsOito.AddDays(1);
    }
}