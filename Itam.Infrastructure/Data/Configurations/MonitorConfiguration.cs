using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class MonitorConfiguration : IEntityTypeConfiguration<Monitor>
{
    public void Configure(EntityTypeBuilder<Monitor> builder)
    {
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