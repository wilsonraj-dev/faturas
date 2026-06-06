using System.Globalization;
using Fatura.Server.Data;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Services;

public class LembretePagamentoProcessamentoService : ILembretePagamentoProcessamentoService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly ILogger<LembretePagamentoProcessamentoService> _logger;

    public LembretePagamentoProcessamentoService(
        AppDbContext db,
        IEmailService emailService,
        ILogger<LembretePagamentoProcessamentoService> logger)
    {
        _db = db;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task ProcessarAsync(DateTime? dataAtual = null, CancellationToken cancellationToken = default)
    {
        var hoje = (dataAtual ?? DateTime.Today).Date;

        var lembretes = await _db.LembretesPagamento
            .Include(l => l.User)
            .Where(l => l.Ativo)
            .ToListAsync(cancellationToken);

        foreach (var lembrete in lembretes)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                var vencimento = CalcularProximoVencimento(lembrete, hoje);
                var tipoEnvio = ObterTipoEnvio(hoje, vencimento);
                if (!tipoEnvio.HasValue)
                {
                    continue;
                }

                var jaEnviado = await _db.LembretesPagamentoHistoricos.AnyAsync(h =>
                    h.LembretePagamentoId == lembrete.Id &&
                    h.DataReferencia == vencimento &&
                    h.TipoEnvio == tipoEnvio.Value &&
                    h.Canal == CanalNotificacao.Email,
                    cancellationToken);

                if (jaEnviado)
                {
                    continue;
                }

                await _emailService.EnviarAsync(
                    lembrete.User.Email,
                    $"Lembrete de Pagamento - {lembrete.NomeConta}",
                    MontarCorpoEmail(lembrete, vencimento));

                _db.LembretesPagamentoHistoricos.Add(new LembretePagamentoHistorico
                {
                    LembretePagamentoId = lembrete.Id,
                    TipoEnvio = tipoEnvio.Value,
                    Canal = CanalNotificacao.Email,
                    DataReferencia = vencimento,
                    DataEnvio = DateTime.UtcNow
                });

                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar lembrete de pagamento {LembretePagamentoId}.", lembrete.Id);
            }
        }
    }

    private static DateTime CalcularProximoVencimento(LembretePagamento lembrete, DateTime hoje)
    {
        var vencimentoMesAtual = CriarDataVencimento(hoje.Year, hoje.Month, lembrete.DiaVencimento);
        if (hoje <= vencimentoMesAtual)
        {
            return vencimentoMesAtual;
        }

        var proximoMes = hoje.AddMonths(1);
        return CriarDataVencimento(proximoMes.Year, proximoMes.Month, lembrete.DiaVencimento);
    }

    private static DateTime CriarDataVencimento(int ano, int mes, int diaVencimento)
    {
        var dia = Math.Min(diaVencimento, DateTime.DaysInMonth(ano, mes));
        return new DateTime(ano, mes, dia);
    }

    private static TipoLembreteEnvio? ObterTipoEnvio(DateTime hoje, DateTime vencimento)
    {
        if (hoje == vencimento.AddDays(-5))
        {
            return TipoLembreteEnvio.CincoDiasAntes;
        }

        if (hoje == vencimento.AddDays(-2))
        {
            return TipoLembreteEnvio.DoisDiasAntes;
        }

        return null;
    }

    private static string MontarCorpoEmail(LembretePagamento lembrete, DateTime vencimento)
    {
        return $"Olá {lembrete.User.Nome},\n\n" +
               "Este é um lembrete automático do seu sistema financeiro.\n\n" +
               "A conta:\n\n" +
               $"{lembrete.NomeConta}\n\n" +
               "no valor de:\n\n" +
               $"{lembrete.ValorConta.ToString("C", new CultureInfo("pt-BR"))}\n\n" +
               $"vence no dia {vencimento:dd}.\n\n" +
               "Realize o pagamento antes do vencimento para evitar juros, multas ou interrupção do serviço.\n\n" +
               "Atenciosamente,\n" +
               "Sistema Financeiro";
    }
}