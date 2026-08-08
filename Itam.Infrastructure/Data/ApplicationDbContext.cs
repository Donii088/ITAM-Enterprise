using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Itam.Infrastructure.Data;

public sealed class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Laptop> Laptops => Set<Laptop>();
    public DbSet<DesktopPc> DesktopPcs => Set<DesktopPc>();
    public DbSet<Monitor> Monitors => Set<Monitor>();
    public DbSet<Dock> Docks => Set<Dock>();
    public DbSet<KeyboardMouseSet> KeyboardMouseSets => Set<KeyboardMouseSet>();

    public DbSet<Storage> StorageDevices => Set<Storage>();
    public DbSet<AssetAssignment> AssetAssignments => Set<AssetAssignment>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<RepairHistory> RepairHistories => Set<RepairHistory>();
    public DbSet<Attachment> Attachments => Set<Attachment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override int SaveChanges()
    {
        ApplyAuditInformation();

        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInformation();

        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditInformation()
    {
        DateTime utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = utcNow;
                    entry.Entity.UpdatedAt = null;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = utcNow;
                    break;
            }
        }
    }
}