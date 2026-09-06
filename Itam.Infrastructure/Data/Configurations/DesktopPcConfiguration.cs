using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class DesktopPcConfiguration : IEntityTypeConfiguration<DesktopPc>
{
    public void Configure(EntityTypeBuilder<DesktopPc> builder)
    {
        // See LaptopConfiguration for why the column name and index filter are pinned explicitly.
        builder.Property(desktopPc => desktopPc.SerialNumber)
            .HasColumnName("SerialNumber")
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(desktopPc => desktopPc.SerialNumber)
            .IsUnique()
            .HasFilter("[SerialNumber] IS NOT NULL");

        builder.Property(desktopPc => desktopPc.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(desktopPc => desktopPc.Model)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(desktopPc => desktopPc.CPU)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(desktopPc => desktopPc.GPU)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(desktopPc => desktopPc.RAM)
            .IsRequired();
    }
}