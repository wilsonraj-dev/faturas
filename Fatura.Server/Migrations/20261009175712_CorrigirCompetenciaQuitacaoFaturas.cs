using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fatura.Server.Migrations
{
    /// <inheritdoc />
    public partial class CorrigirCompetenciaQuitacaoFaturas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // O cálculo anterior registrava a quitação no mês seguinte ao da fatura.
            // Corrige apenas lançamentos gerados pela quitação e ainda com a mesma
            // data da fatura, preservando lançamentos manuais e datas alteradas depois.
            migrationBuilder.Sql("""
                UPDATE "LancamentosFinanceiros" AS l
                SET "Data" = l."Data" - INTERVAL '1 month'
                FROM "Parcelas" AS p
                JOIN "Faturas" AS f ON f."Id" = p."FaturaId"
                WHERE l."Origem" = 2
                  AND l."OrigemId" = p."Id"
                  AND l."UserId" = f."UserId"
                  AND f."Quitada" = TRUE
                  AND f."DataPagamento" IS NOT NULL
                  AND date_trunc('month', f."DataPagamento") = make_date(f."Ano", f."Mes", 1) + INTERVAL '1 month'
                  AND l."Data" = f."DataPagamento";
                """);

            migrationBuilder.Sql("""
                UPDATE "Faturas" AS f
                SET "DataPagamento" = f."DataPagamento" - INTERVAL '1 month'
                WHERE f."Quitada" = TRUE
                  AND f."DataPagamento" IS NOT NULL
                  AND date_trunc('month', f."DataPagamento") = make_date(f."Ano", f."Mes", 1) + INTERVAL '1 month';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // A data original informada pelo usuário não pode ser recuperada.
            // Reverter a migração não deve deslocar pagamentos corretos novamente.
        }
    }
}
