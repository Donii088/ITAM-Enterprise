using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class KeyboardMouseSetConfiguration : IEntityTypeConfiguration<KeyboardMouseSet>
{
    public void Configure(EntityTypeBuilder<KeyboardMouseSet> builder)
    {
        // Optional, unlike Laptop/DesktopPc's SerialNumber — see MonitorConfiguration for why the
        // column name and filtered unique index are pinned explicitly.
        builder.Property(keyboardMouseSet => keyboardMouseSet.SerialNumber)
            .HasColumnName("KeyboardMouseSet_SerialNumber")
            .HasMaxLength(150);

        builder.HasIndex(keyboardMouseSet => keyboardMouseSet.SerialNumber)
            .IsUnique()
            .HasFilter("[KeyboardMouseSet_SerialNumber] IS NOT NULL");

        builder.Property(keyboardMouseSet => keyboardMouseSet.Brand)
            .HasMaxLength(100)
            .IsRequired();

        // Pinned to its existing (previously implicit/unprefixed) column name now that Headset
        // introduces a second sibling with a ConnectionType property, so the new sibling's shadow
        // column can't be assigned this name instead and silently move existing data.
        builder.Property(keyboardMouseSet => keyboardMouseSet.ConnectionType)
            .HasColumnName("ConnectionType")
            .IsRequired();
    }
}