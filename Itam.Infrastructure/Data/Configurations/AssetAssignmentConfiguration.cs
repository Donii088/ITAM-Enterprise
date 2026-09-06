using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Itam.Infrastructure.Data.Configurations;

public sealed class AssetAssignmentConfiguration : IEntityTypeConfiguration<AssetAssignment>
{
    public void Configure(EntityTypeBuilder<AssetAssignment> builder)
    {
        builder.ToTable("AssetAssignments", table =>
        {
            table.HasCheckConstraint(
                "CK_AssetAssignments_UnassignedAfterAssigned",
                "[UnassignedAt] IS NULL OR [UnassignedAt] >= [AssignedAt]");
        });

        builder.HasKey(assignment => assignment.Id);

        builder.Property(assignment => assignment.AssignedAt)
            .IsRequired();

        builder.HasOne(assignment => assignment.Asset)
            .WithMany(asset => asset.AssetAssignments)
            .HasForeignKey(assignment => assignment.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        // SetNull (not Restrict): a hard-deleted employee's closed-out assignment history is kept
        // for audit purposes, with EmployeeId anonymized to null. Active assignments can't reach
        // this path because UserService.HardDeleteAsync refuses to delete a user with one.
        builder.HasOne(assignment => assignment.Employee)
            .WithMany(user => user.AssetAssignments)
            .HasForeignKey(assignment => assignment.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(assignment => assignment.EmployeeId);

        builder.HasIndex(assignment => new
        {
            assignment.AssetId,
            assignment.UnassignedAt
        })
        .IsUnique()
        .HasFilter("[UnassignedAt] IS NULL");
    }
}