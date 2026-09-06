using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class DockConfiguration : IEntityTypeConfiguration<Dock>
{
    public void Configure(EntityTypeBuilder<Dock> builder)
    {
        // Optional, unlike Laptop/DesktopPc's SerialNumber — see MonitorConfiguration for why the
        // column name and filtered unique index are pinned explicitly.
        builder.Property(dock => dock.SerialNumber)
            .HasColumnName("Dock_SerialNumber")
            .HasMaxLength(150);

        builder.HasIndex(dock => dock.SerialNumber)
            .IsUnique()
            .HasFilter("[Dock_SerialNumber] IS NOT NULL");

        builder.Property(dock => dock.Brand)
            .HasMaxLength(100)
            .IsRequired();
    }
}