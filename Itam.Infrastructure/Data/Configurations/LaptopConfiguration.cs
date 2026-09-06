using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class LaptopConfiguration : IEntityTypeConfiguration<Laptop>
{
    public void Configure(EntityTypeBuilder<Laptop> builder)
    {
        // Explicit column name because Laptop and DesktopPc are siblings in the same TPH table
        // ("Assets") and both declare a SerialNumber property; without an explicit name EF assigns
        // shadow column names to disambiguate them (e.g. "Laptop_SerialNumber"), and the unique
        // index's filter predicate below must reference that exact physical column name, not the
        // CLR property name, or the constraint silently applies to zero rows.
        builder.Property(laptop => laptop.SerialNumber)
            .HasColumnName("Laptop_SerialNumber")
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(laptop => laptop.SerialNumber)
            .IsUnique()
            .HasFilter("[Laptop_SerialNumber] IS NOT NULL");

        builder.Property(laptop => laptop.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(laptop => laptop.Model)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(laptop => laptop.CPU)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(laptop => laptop.GPU)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(laptop => laptop.RAM)
            .IsRequired();
    }
}