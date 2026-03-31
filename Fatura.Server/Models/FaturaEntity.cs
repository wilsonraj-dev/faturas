using System.ComponentModel.DataAnnotations.Schema;

namespace Fatura.Server.Models;

/// <summary>
/// Representa a fatura mensal do cartão de crédito.
/// O nome da classe usa "FaturaEntity" para evitar conflito com o namespace raiz "Fatura",
/// mas a tabela no banco de dados é mapeada como "Faturas".
/// </summary>
[Table("Faturas")]
public class FaturaEntity
{
    public int Id { get; set; }
    public int Mes { get; set; }
    public int Ano { get; set; }
    public decimal ValorTotal { get; set; }
    public bool Quitada { get; set; }
    public double Orcamento { get; set; }
    public int UserId { get; set; }

    // Navegação: parcelas vinculadas a esta fatura
    public List<Parcela> Parcelas { get; set; } = [];
    public User User { get; set; } = null!;
}
