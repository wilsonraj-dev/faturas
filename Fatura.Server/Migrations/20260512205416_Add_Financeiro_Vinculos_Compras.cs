using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fatura.Server.Migrations
{
    /// <inheritdoc />
    public partial class Add_Financeiro_Vinculos_Compras : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoriaId",
                table: "Simulacoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContaFinanceiraId",
                table: "Simulacoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubcategoriaId",
                table: "Simulacoes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CategoriaId",
                table: "ComprasRecorrentes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContaFinanceiraId",
                table: "ComprasRecorrentes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubcategoriaId",
                table: "ComprasRecorrentes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CategoriaId",
                table: "Compras",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContaFinanceiraId",
                table: "Compras",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubcategoriaId",
                table: "Compras",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Simulacoes_CategoriaId",
                table: "Simulacoes",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Simulacoes_ContaFinanceiraId",
                table: "Simulacoes",
                column: "ContaFinanceiraId");

            migrationBuilder.CreateIndex(
                name: "IX_Simulacoes_SubcategoriaId",
                table: "Simulacoes",
                column: "SubcategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_ComprasRecorrentes_CategoriaId",
                table: "ComprasRecorrentes",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_ComprasRecorrentes_ContaFinanceiraId",
                table: "ComprasRecorrentes",
                column: "ContaFinanceiraId");

            migrationBuilder.CreateIndex(
                name: "IX_ComprasRecorrentes_SubcategoriaId",
                table: "ComprasRecorrentes",
                column: "SubcategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Compras_CategoriaId",
                table: "Compras",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Compras_ContaFinanceiraId",
                table: "Compras",
                column: "ContaFinanceiraId");

            migrationBuilder.CreateIndex(
                name: "IX_Compras_SubcategoriaId",
                table: "Compras",
                column: "SubcategoriaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Compras_Categorias_CategoriaId",
                table: "Compras",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Compras_ContasFinanceiras_ContaFinanceiraId",
                table: "Compras",
                column: "ContaFinanceiraId",
                principalTable: "ContasFinanceiras",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Compras_Subcategorias_SubcategoriaId",
                table: "Compras",
                column: "SubcategoriaId",
                principalTable: "Subcategorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ComprasRecorrentes_Categorias_CategoriaId",
                table: "ComprasRecorrentes",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ComprasRecorrentes_ContasFinanceiras_ContaFinanceiraId",
                table: "ComprasRecorrentes",
                column: "ContaFinanceiraId",
                principalTable: "ContasFinanceiras",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ComprasRecorrentes_Subcategorias_SubcategoriaId",
                table: "ComprasRecorrentes",
                column: "SubcategoriaId",
                principalTable: "Subcategorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Simulacoes_Categorias_CategoriaId",
                table: "Simulacoes",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Simulacoes_ContasFinanceiras_ContaFinanceiraId",
                table: "Simulacoes",
                column: "ContaFinanceiraId",
                principalTable: "ContasFinanceiras",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Simulacoes_Subcategorias_SubcategoriaId",
                table: "Simulacoes",
                column: "SubcategoriaId",
                principalTable: "Subcategorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Compras_Categorias_CategoriaId",
                table: "Compras");

            migrationBuilder.DropForeignKey(
                name: "FK_Compras_ContasFinanceiras_ContaFinanceiraId",
                table: "Compras");

            migrationBuilder.DropForeignKey(
                name: "FK_Compras_Subcategorias_SubcategoriaId",
                table: "Compras");

            migrationBuilder.DropForeignKey(
                name: "FK_ComprasRecorrentes_Categorias_CategoriaId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropForeignKey(
                name: "FK_ComprasRecorrentes_ContasFinanceiras_ContaFinanceiraId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropForeignKey(
                name: "FK_ComprasRecorrentes_Subcategorias_SubcategoriaId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropForeignKey(
                name: "FK_Simulacoes_Categorias_CategoriaId",
                table: "Simulacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Simulacoes_ContasFinanceiras_ContaFinanceiraId",
                table: "Simulacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Simulacoes_Subcategorias_SubcategoriaId",
                table: "Simulacoes");

            migrationBuilder.DropIndex(
                name: "IX_Simulacoes_CategoriaId",
                table: "Simulacoes");

            migrationBuilder.DropIndex(
                name: "IX_Simulacoes_ContaFinanceiraId",
                table: "Simulacoes");

            migrationBuilder.DropIndex(
                name: "IX_Simulacoes_SubcategoriaId",
                table: "Simulacoes");

            migrationBuilder.DropIndex(
                name: "IX_ComprasRecorrentes_CategoriaId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropIndex(
                name: "IX_ComprasRecorrentes_ContaFinanceiraId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropIndex(
                name: "IX_ComprasRecorrentes_SubcategoriaId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropIndex(
                name: "IX_Compras_CategoriaId",
                table: "Compras");

            migrationBuilder.DropIndex(
                name: "IX_Compras_ContaFinanceiraId",
                table: "Compras");

            migrationBuilder.DropIndex(
                name: "IX_Compras_SubcategoriaId",
                table: "Compras");

            migrationBuilder.DropColumn(
                name: "CategoriaId",
                table: "Simulacoes");

            migrationBuilder.DropColumn(
                name: "ContaFinanceiraId",
                table: "Simulacoes");

            migrationBuilder.DropColumn(
                name: "SubcategoriaId",
                table: "Simulacoes");

            migrationBuilder.DropColumn(
                name: "CategoriaId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropColumn(
                name: "ContaFinanceiraId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropColumn(
                name: "SubcategoriaId",
                table: "ComprasRecorrentes");

            migrationBuilder.DropColumn(
                name: "CategoriaId",
                table: "Compras");

            migrationBuilder.DropColumn(
                name: "ContaFinanceiraId",
                table: "Compras");

            migrationBuilder.DropColumn(
                name: "SubcategoriaId",
                table: "Compras");
        }
    }
}
