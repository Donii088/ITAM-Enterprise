using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class StorageConfiguration : IEntityTypeConfiguration<Storage>
{
    public void Configure(EntityTypeBuilder<Storage> builder)
    {
        builder.ToTable("StorageDevices", table =>
        {
            table.HasCheckConstraint(
                "CK_StorageDevices_ExclusiveOwner",
                "NOT ([LaptopId] IS NOT NULL AND [PcId] IS NOT NULL)");

            table.HasCheckConstraint(
                "CK_StorageDevices_Capacity",
                "[Capacity] > 0");
        });

        builder.HasKey(storage => storage.Id);

        builder.Property(storage => storage.SerialNumber)
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(storage => storage.SerialNumber)
            .IsUnique();

        builder.Property(storage => storage.Capacity)
            .IsRequired();

        builder.Property(storage => storage.StorageType)
            .IsRequired();

        builder.Property(storage => storage.StorageUnit)
            .IsRequired();

        builder.Property(storage => storage.DesktopPcId)
            .HasColumnName("PcId");

        builder.HasOne(storage => storage.Laptop)
            .WithMany(laptop => laptop.StorageDevices)
            .HasForeignKey(storage => storage.LaptopId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(storage => storage.DesktopPc)
            .WithMany(desktopPc => desktopPc.StorageDevices)
            .HasForeignKey(storage => storage.DesktopPcId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(storage => storage.LaptopId);
        builder.HasIndex(storage => storage.DesktopPcId);
    }
}