using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Fatura.Server.Data;

/// <summary>
/// Mantém a semântica de data/hora sem fuso usada pelo domínio e pelo banco anterior.
/// O Npgsql exige Kind.Unspecified ao persistir valores em timestamp without time zone.
/// </summary>
public sealed class DateTimeToUnspecifiedConverter : ValueConverter<DateTime, DateTime>
{
    public DateTimeToUnspecifiedConverter()
        : base(
            value => DateTime.SpecifyKind(value, DateTimeKind.Unspecified),
            value => DateTime.SpecifyKind(value, DateTimeKind.Unspecified))
    {
    }
}

public sealed class NullableDateTimeToUnspecifiedConverter : ValueConverter<DateTime?, DateTime?>
{
    public NullableDateTimeToUnspecifiedConverter()
        : base(
            value => value.HasValue
                ? DateTime.SpecifyKind(value.Value, DateTimeKind.Unspecified)
                : value,
            value => value.HasValue
                ? DateTime.SpecifyKind(value.Value, DateTimeKind.Unspecified)
                : value)
    {
    }
}
