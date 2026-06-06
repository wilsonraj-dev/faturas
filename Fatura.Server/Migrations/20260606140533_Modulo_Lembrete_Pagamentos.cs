using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Fatura.Server.Migrations
{
    /// <inheritdoc />
    public partial class Modulo_Lembrete_Pagamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LembretesPagamento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    NomeConta = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    ValorConta = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiaVencimento = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LembretesPagamento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LembretesPagamento_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LembretesPagamentoHistoricos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    LembretePagamentoId = table.Column<int>(type: "int", nullable: false),
                    TipoEnvio = table.Column<int>(type: "int", nullable: false),
                    Canal = table.Column<int>(type: "int", nullable: false),
                    DataReferencia = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DataEnvio = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LembretesPagamentoHistoricos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LembretesPagamentoHistoricos_LembretesPagamento_LembretePaga~",
                        column: x => x.LembretePagamentoId,
                        principalTable: "LembretesPagamento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_LembretesPagamento_UserId",
                table: "LembretesPagamento",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LembretesPagamentoHistoricos_LembretePagamentoId",
                table: "LembretesPagamentoHistoricos",
                column: "LembretePagamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_LembretesPagamentoHistoricos_LembretePagamentoId_DataReferen~",
                table: "LembretesPagamentoHistoricos",
                columns: new[] { "LembretePagamentoId", "DataReferencia", "TipoEnvio", "Canal" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LembretesPagamentoHistoricos");

            migrationBuilder.DropTable(
                name: "LembretesPagamento");
        }
    }
}
