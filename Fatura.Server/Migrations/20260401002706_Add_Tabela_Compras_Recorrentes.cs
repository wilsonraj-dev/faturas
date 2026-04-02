using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Fatura.Server.Migrations
{
    /// <inheritdoc />
    public partial class Add_Tabela_Compras_Recorrentes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "CompraId",
                table: "Parcelas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "CompraRecorrenteId",
                table: "Parcelas",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Tipo",
                table: "Parcelas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ComprasRecorrentes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nome = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    ValorMensal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiaCobranca = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprasRecorrentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComprasRecorrentes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Parcelas_CompraRecorrenteId",
                table: "Parcelas",
                column: "CompraRecorrenteId");

            migrationBuilder.CreateIndex(
                name: "IX_ComprasRecorrentes_UserId",
                table: "ComprasRecorrentes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Parcelas_ComprasRecorrentes_CompraRecorrenteId",
                table: "Parcelas",
                column: "CompraRecorrenteId",
                principalTable: "ComprasRecorrentes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parcelas_ComprasRecorrentes_CompraRecorrenteId",
                table: "Parcelas");

            migrationBuilder.DropTable(
                name: "ComprasRecorrentes");

            migrationBuilder.DropIndex(
                name: "IX_Parcelas_CompraRecorrenteId",
                table: "Parcelas");

            migrationBuilder.DropColumn(
                name: "CompraRecorrenteId",
                table: "Parcelas");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Parcelas");

            migrationBuilder.AlterColumn<int>(
                name: "CompraId",
                table: "Parcelas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
