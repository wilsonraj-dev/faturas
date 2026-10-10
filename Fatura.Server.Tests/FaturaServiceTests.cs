using System.Reflection;
using Fatura.Server.Models;
using Fatura.Server.Services;
using Xunit;

namespace Fatura.Server.Tests;

public class FaturaServiceTests
{
    [Theory]
    [InlineData(2026, 10, 9, 2026, 10, 9)]
    [InlineData(2026, 12, 9, 2026, 12, 9)]
    [InlineData(2026, 2, 31, 2026, 2, 28)]
    [InlineData(2028, 2, 31, 2028, 2, 29)]
    public void QuitacaoFicaNoMesDaFatura(int ano, int mes, int diaInformado, int anoEsperado, int mesEsperado, int diaEsperado)
    {
        var fatura = new FaturaEntity { Ano = ano, Mes = mes };
        var referencia = new DateTime(2026, 1, diaInformado, 14, 30, 0, DateTimeKind.Utc);

        var resultado = CalcularDataPagamento(fatura, referencia);

        Assert.Equal(new DateTime(anoEsperado, mesEsperado, diaEsperado, 14, 30, 0, DateTimeKind.Utc), resultado);
        Assert.Equal(DateTimeKind.Utc, resultado.Kind);
    }

    private static DateTime CalcularDataPagamento(FaturaEntity fatura, DateTime referencia)
    {
        var metodo = typeof(FaturaService).GetMethod("CalcularDataPagamento", BindingFlags.NonPublic | BindingFlags.Static);
        Assert.NotNull(metodo);
        return (DateTime)metodo.Invoke(null, [fatura, referencia])!;
    }
}
