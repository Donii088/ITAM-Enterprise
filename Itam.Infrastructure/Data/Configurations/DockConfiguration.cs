using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class DockConfiguration : IEntityTypeConfiguration<Dock>
{
    public void Configure(EntityTypeBuilder<Dock> builder)
    {
        builder.Property(dock => dock.Brand)
            .HasMaxLength(100)
            .IsRequired();
    }
}