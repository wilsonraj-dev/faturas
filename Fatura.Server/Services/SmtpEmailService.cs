using System.Net;
using System.Net.Mail;

namespace Fatura.Server.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public SmtpEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task EnviarAsync(string destinatario, string assunto, string corpo)
    {
        var host = ObterConfiguracaoObrigatoria("SMTP_HOST");
        var port = int.Parse(ObterConfiguracaoObrigatoria("SMTP_PORT"));
        var user = ObterConfiguracaoObrigatoria("SMTP_USER");
        var password = ObterConfiguracaoObrigatoria("SMTP_PASSWORD");
        var from = ObterConfiguracaoObrigatoria("SMTP_FROM");

        using var message = new MailMessage(from, destinatario, assunto, corpo)
        {
            IsBodyHtml = false
        };

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(user, password)
        };

        await client.SendMailAsync(message);
    }

    private string ObterConfiguracaoObrigatoria(string chave)
    {
        var valor = _configuration[chave];
        if (string.IsNullOrWhiteSpace(valor))
        {
            throw new InvalidOperationException($"A configuração SMTP obrigatória '{chave}' não foi informada.");
        }

        return valor;
    }
}