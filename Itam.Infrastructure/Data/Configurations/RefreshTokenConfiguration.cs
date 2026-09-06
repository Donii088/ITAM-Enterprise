using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(token => token.Id);

        builder.Property(token => token.Token)
            .HasMaxLength(500)
            .IsRequired();

        builder.HasIndex(token => token.Token)
            .IsUnique();

        builder.Property(token => token.Expires)
            .IsRequired();

        builder.Property(token => token.Created)
            .IsRequired();

        builder.Property(token => token.Revoked);

        builder.Property(token => token.ReplacedByToken)
            .HasMaxLength(500);

        builder.Property(token => token.ReasonRevoked)
            .HasMaxLength(200);

        builder.HasOne(token => token.User)
            .WithMany(user => user.RefreshTokens)
            .HasForeignKey(token => token.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(token => token.UserId);
    }
}