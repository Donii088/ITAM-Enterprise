using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.ToTable("Tickets");

        builder.HasKey(ticket => ticket.Id);

        builder.Property(ticket => ticket.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(ticket => ticket.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(ticket => ticket.Priority)
            .IsRequired();

        builder.Property(ticket => ticket.Status)
            .IsRequired();

        builder.HasIndex(ticket => ticket.Priority);
        builder.HasIndex(ticket => ticket.Status);
        builder.HasIndex(ticket => ticket.EmployeeId);
        builder.HasIndex(ticket => ticket.AssetId);

        builder.HasOne(ticket => ticket.Employee)
            .WithMany(user => user.Tickets)
            .HasForeignKey(ticket => ticket.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ticket => ticket.Asset)
            .WithMany(asset => asset.Tickets)
            .HasForeignKey(ticket => ticket.AssetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}