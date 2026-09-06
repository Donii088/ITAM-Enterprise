using Itam.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Itam.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Asset> Assets { get; }
    DbSet<Laptop> Laptops { get; }
    DbSet<DesktopPc> DesktopPcs { get; }
    DbSet<Monitor> Monitors { get; }
    DbSet<Dock> Docks { get; }
    DbSet<KeyboardMouseSet> KeyboardMouseSets { get; }
    DbSet<Headset> Headsets { get; }
    DbSet<Storage> StorageDevices { get; }
    DbSet<AssetAssignment> AssetAssignments { get; }
    DbSet<Ticket> Tickets { get; }
    DbSet<RepairHistory> RepairHistories { get; }
    DbSet<Attachment> Attachments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}