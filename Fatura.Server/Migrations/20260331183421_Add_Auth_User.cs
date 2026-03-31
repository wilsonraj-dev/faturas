using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Fatura.Server.Migrations
{
    /// <inheritdoc />
    public partial class Add_Auth_User : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop condicional: o índice pode não existir com esse nome no MySQL.
            // Usa stored procedure temporária para permitir IF/THEN em DDL.
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `__EF_DropIndexIfExists`;");
            migrationBuilder.Sql(@"
                                CREATE PROCEDURE `__EF_DropIndexIfExists`()
                                BEGIN
                                    IF EXISTS (
                                        SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
                                        WHERE TABLE_SCHEMA = DATABASE()
                                            AND TABLE_NAME = 'Faturas'
                                            AND INDEX_NAME = 'IX_Faturas_Mes_Ano'
                                    ) THEN
                                        DROP INDEX `IX_Faturas_Mes_Ano` ON `Faturas`;
                                    END IF;
                                END;
                                ");
            migrationBuilder.Sql("CALL `__EF_DropIndexIfExists`();");
            migrationBuilder.Sql("DROP PROCEDURE `__EF_DropIndexIfExists`;");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Simulacoes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Parcelas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Fornecedores",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Faturas",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Compras",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Nome = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Simulacoes_UserId",
                table: "Simulacoes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Fornecedores_UserId",
                table: "Fornecedores",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Faturas_Mes_Ano_UserId",
                table: "Faturas",
                columns: new[] { "Mes", "Ano", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Faturas_UserId",
                table: "Faturas",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Compras_UserId",
                table: "Compras",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Compras_Users_UserId",
                table: "Compras",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Faturas_Users_UserId",
                table: "Faturas",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Fornecedores_Users_UserId",
                table: "Fornecedores",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Simulacoes_Users_UserId",
                table: "Simulacoes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Compras_Users_UserId",
                table: "Compras");

            migrationBuilder.DropForeignKey(
                name: "FK_Faturas_Users_UserId",
                table: "Faturas");

            migrationBuilder.DropForeignKey(
                name: "FK_Fornecedores_Users_UserId",
                table: "Fornecedores");

            migrationBuilder.DropForeignKey(
                name: "FK_Simulacoes_Users_UserId",
                table: "Simulacoes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Simulacoes_UserId",
                table: "Simulacoes");

            migrationBuilder.DropIndex(
                name: "IX_Fornecedores_UserId",
                table: "Fornecedores");

            migrationBuilder.DropIndex(
                name: "IX_Faturas_Mes_Ano_UserId",
                table: "Faturas");

            migrationBuilder.DropIndex(
                name: "IX_Faturas_UserId",
                table: "Faturas");

            migrationBuilder.DropIndex(
                name: "IX_Compras_UserId",
                table: "Compras");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Simulacoes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Parcelas");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Fornecedores");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Faturas");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Compras");

            migrationBuilder.CreateIndex(
                name: "IX_Faturas_Mes_Ano",
                table: "Faturas",
                columns: new[] { "Mes", "Ano" },
                unique: true);
        }
    }
}
