using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Itam.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixLaptopSerialNumberUniqueIndexFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Assets_Laptop_SerialNumber",
                table: "Assets");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Laptop_SerialNumber",
                table: "Assets",
                column: "Laptop_SerialNumber",
                unique: true,
                filter: "[Laptop_SerialNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Assets_Laptop_SerialNumber",
                table: "Assets");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Laptop_SerialNumber",
                table: "Assets",
                column: "Laptop_SerialNumber",
                unique: true,
                filter: "[SerialNumber] IS NOT NULL");
        }
    }
}
