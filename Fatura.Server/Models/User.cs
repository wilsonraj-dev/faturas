namespace Fatura.Server.Models;

/// <summary>
/// Representa um usuário do sistema.
/// </summary>
public class User
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Navegação
    public List<Compra> Compras { get; set; } = [];
    public List<FaturaEntity> Faturas { get; set; } = [];
    public List<Fornecedor> Fornecedores { get; set; } = [];
    public List<Simulacao> Simulacoes { get; set; } = [];
}
