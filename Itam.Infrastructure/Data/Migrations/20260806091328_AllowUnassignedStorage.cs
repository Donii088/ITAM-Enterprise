using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Itam.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AllowUnassignedStorage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_StorageDevices_ExclusiveOwner",
                table: "StorageDevices");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StorageDevices_ExclusiveOwner",
                table: "StorageDevices",
                sql: "NOT ([LaptopId] IS NOT NULL AND [PcId] IS NOT NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_StorageDevices_ExclusiveOwner",
                table: "StorageDevices");

            migrationBuilder.AddCheckConstraint(
                name: "CK_StorageDevices_ExclusiveOwner",
                table: "StorageDevices",
                sql: "([LaptopId] IS NOT NULL AND [PcId] IS NULL) OR ([LaptopId] IS NULL AND [PcId] IS NOT NULL)");
        }
    }
}
