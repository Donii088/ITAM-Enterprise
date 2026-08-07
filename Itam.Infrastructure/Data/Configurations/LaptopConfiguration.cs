using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class LaptopConfiguration : IEntityTypeConfiguration<Laptop>
{
    public void Configure(EntityTypeBuilder<Laptop> builder)
    {
        builder.Property(laptop => laptop.SerialNumber)
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(laptop => laptop.SerialNumber)
            .IsUnique();

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