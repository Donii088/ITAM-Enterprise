using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class HeadsetConfiguration : IEntityTypeConfiguration<Headset>
{
    public void Configure(EntityTypeBuilder<Headset> builder)
    {
        // Optional — same pattern as Monitor/Dock/KeyboardMouseSet's SerialNumber: explicit
        // column name (rather than relying on EF's auto shadow-property naming) plus a
        // NOT-NULL-filtered unique index so multiple headsets with no serial number don't collide.
        builder.Property(headset => headset.SerialNumber)
            .HasColumnName("Headset_SerialNumber")
            .HasMaxLength(150);

        builder.HasIndex(headset => headset.SerialNumber)
            .IsUnique()
            .HasFilter("[Headset_SerialNumber] IS NOT NULL");

        builder.Property(headset => headset.Brand)
            .HasMaxLength(100)
            .IsRequired();

        // Explicit column name so this doesn't collide with KeyboardMouseSet's own
        // ConnectionType property, which is pinned to the unprefixed "ConnectionType" column.
        builder.Property(headset => headset.ConnectionType)
            .HasColumnName("Headset_ConnectionType")
            .IsRequired();
    }
}
