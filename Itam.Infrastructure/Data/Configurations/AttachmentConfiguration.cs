using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.ToTable("Attachments", table =>
        {
            table.HasCheckConstraint(
                "CK_Attachments_SingleOwner",
                "(CASE WHEN [TicketId] IS NOT NULL THEN 1 ELSE 0 END + " +
                "CASE WHEN [RepairHistoryId] IS NOT NULL THEN 1 ELSE 0 END + " +
                "CASE WHEN [AssetId] IS NOT NULL THEN 1 ELSE 0 END) = 1");

            table.HasCheckConstraint(
                "CK_Attachments_FileSize",
                "[FileSize] > 0");
        });

        builder.HasKey(attachment => attachment.Id);

        builder.Property(attachment => attachment.FileName)
            .HasMaxLength(260)
            .IsRequired();

        builder.Property(attachment => attachment.FileExtension)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(attachment => attachment.FileSize)
            .IsRequired();

        builder.Property(attachment => attachment.FilePath)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(attachment => attachment.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(attachment => attachment.TicketId);
        builder.HasIndex(attachment => attachment.RepairHistoryId);
        builder.HasIndex(attachment => attachment.AssetId);
        builder.HasIndex(attachment => attachment.UploadedByUserId);

        builder.HasOne(attachment => attachment.Ticket)
            .WithMany(ticket => ticket.Attachments)
            .HasForeignKey(attachment => attachment.TicketId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(attachment => attachment.RepairHistory)
            .WithMany(repairHistory => repairHistory.Attachments)
            .HasForeignKey(attachment => attachment.RepairHistoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(attachment => attachment.Asset)
            .WithMany(asset => asset.Attachments)
            .HasForeignKey(attachment => attachment.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(attachment => attachment.UploadedBy)
            .WithMany(user => user.UploadedAttachments)
            .HasForeignKey(attachment => attachment.UploadedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}