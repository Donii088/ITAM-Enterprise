using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Itam.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttachmentUploadedByUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UploadedByUserId",
                table: "Attachments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_UploadedByUserId",
                table: "Attachments",
                column: "UploadedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachments_Users_UploadedByUserId",
                table: "Attachments",
                column: "UploadedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachments_Users_UploadedByUserId",
                table: "Attachments");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_UploadedByUserId",
                table: "Attachments");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "Attachments");
        }
    }
}
