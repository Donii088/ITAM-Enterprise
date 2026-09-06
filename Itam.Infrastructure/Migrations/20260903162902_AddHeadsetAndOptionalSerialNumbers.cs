using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Itam.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHeadsetAndOptionalSerialNumbers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Dock_SerialNumber",
                table: "Assets",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Headset_Brand",
                table: "Assets",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Headset_ConnectionType",
                table: "Assets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Headset_SerialNumber",
                table: "Assets",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KeyboardMouseSet_SerialNumber",
                table: "Assets",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Monitor_SerialNumber",
                table: "Assets",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Dock_SerialNumber",
                table: "Assets",
                column: "Dock_SerialNumber",
                unique: true,
                filter: "[Dock_SerialNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Headset_SerialNumber",
                table: "Assets",
                column: "Headset_SerialNumber",
                unique: true,
                filter: "[Headset_SerialNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_KeyboardMouseSet_SerialNumber",
                table: "Assets",
                column: "KeyboardMouseSet_SerialNumber",
                unique: true,
                filter: "[KeyboardMouseSet_SerialNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_Monitor_SerialNumber",
                table: "Assets",
                column: "Monitor_SerialNumber",
                unique: true,
                filter: "[Monitor_SerialNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Assets_Dock_SerialNumber",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_Headset_SerialNumber",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_KeyboardMouseSet_SerialNumber",
                table: "Assets");

            migrationBuilder.DropIndex(
                name: "IX_Assets_Monitor_SerialNumber",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Dock_SerialNumber",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Headset_Brand",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Headset_ConnectionType",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Headset_SerialNumber",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "KeyboardMouseSet_SerialNumber",
                table: "Assets");

            migrationBuilder.DropColumn(
                name: "Monitor_SerialNumber",
                table: "Assets");
        }
    }
}
