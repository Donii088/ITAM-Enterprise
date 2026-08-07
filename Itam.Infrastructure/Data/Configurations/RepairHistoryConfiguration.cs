using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class RepairHistoryConfiguration : IEntityTypeConfiguration<RepairHistory>
{
    public void Configure(EntityTypeBuilder<RepairHistory> builder)
    {
        builder.ToTable("RepairHistories");

        builder.HasKey(repairHistory => repairHistory.Id);

        builder.Property(repairHistory => repairHistory.RepairDescription)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(repairHistory => repairHistory.RepairDate)
            .IsRequired();

        builder.HasIndex(repairHistory => repairHistory.TicketId);
        builder.HasIndex(repairHistory => repairHistory.AssetId);
        builder.HasIndex(repairHistory => repairHistory.AdminId);

        builder.HasOne(repairHistory => repairHistory.Ticket)
            .WithMany(ticket => ticket.RepairHistories)
            .HasForeignKey(repairHistory => repairHistory.TicketId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(repairHistory => repairHistory.Asset)
            .WithMany(asset => asset.RepairHistories)
            .HasForeignKey(repairHistory => repairHistory.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(repairHistory => repairHistory.Admin)
            .WithMany(user => user.RepairHistories)
            .HasForeignKey(repairHistory => repairHistory.AdminId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}