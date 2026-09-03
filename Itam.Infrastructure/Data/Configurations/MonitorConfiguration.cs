using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class MonitorConfiguration : IEntityTypeConfiguration<Monitor>
{
    public void Configure(EntityTypeBuilder<Monitor> builder)
    {
        // Optional, unlike Laptop/DesktopPc's SerialNumber — explicit column name (rather than
        // relying on EF's auto shadow-property naming) and a NOT-NULL-filtered unique index so
        // multiple monitors with no serial number don't collide. See LaptopConfiguration for the
        // history behind pinning this explicitly.
        builder.Property(monitor => monitor.SerialNumber)
            .HasColumnName("Monitor_SerialNumber")
            .HasMaxLength(150);

        builder.HasIndex(monitor => monitor.SerialNumber)
            .IsUnique()
            .HasFilter("[Monitor_SerialNumber] IS NOT NULL");

        builder.Property(monitor => monitor.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(monitor => monitor.Resolution)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(monitor => monitor.RefreshRate)
            .IsRequired();

        builder.Property(monitor => monitor.Size)
            .IsRequired();
    }
}