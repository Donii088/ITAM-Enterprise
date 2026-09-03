using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("Assets");

        builder.HasKey(asset => asset.Id);

        builder.Property(asset => asset.AssetType)
            .IsRequired();

        builder.Property(asset => asset.Status)
            .IsRequired();

        builder.HasIndex(asset => asset.Status);

        builder.HasDiscriminator(asset => asset.AssetType)
            .HasValue<Laptop>(AssetType.Laptop)
            .HasValue<DesktopPc>(AssetType.DesktopPc)
            .HasValue<Monitor>(AssetType.Monitor)
            .HasValue<Dock>(AssetType.Dock)
            .HasValue<KeyboardMouseSet>(AssetType.KeyboardMouseSet)
            .HasValue<Headset>(AssetType.Headset);
    }
}