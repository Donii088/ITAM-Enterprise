using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class KeyboardMouseSetConfiguration : IEntityTypeConfiguration<KeyboardMouseSet>
{
    public void Configure(EntityTypeBuilder<KeyboardMouseSet> builder)
    {
        builder.Property(keyboardMouseSet => keyboardMouseSet.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(keyboardMouseSet => keyboardMouseSet.ConnectionType)
            .IsRequired();
    }
}