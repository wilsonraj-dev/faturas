using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fatura.Server.Migrations
{
    /// <inheritdoc />
    public partial class Add_Faturas_DataPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataPagamento",
                table: "Faturas",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataPagamento",
                table: "Faturas");
        }
    }
}
