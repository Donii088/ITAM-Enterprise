using Itam.Application.Common;
using Itam.Application.DTOs.Assets;
using Itam.Application.Interfaces;
using Itam.Domain.Constants;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class AssetService : IAssetService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AssetService> _logger;

    public AssetService(
        IApplicationDbContext dbContext,
        IFileStorageService fileStorage,
        ICurrentUserService currentUserService,
        ILogger<AssetService> logger)
    {
        _dbContext = dbContext;
        _fileStorage = fileStorage;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<AssetDetailsDto> CreateLaptopAsync(CreateLaptopRequestDto request, CancellationToken ct = default)
    {
        var laptop = new Laptop
        {
            SerialNumber = request.SerialNumber,
            Brand = request.Brand,
            Model = request.Model,
            CPU = request.Cpu,
            GPU = request.Gpu,
            RAM = request.Ram,
            Status = AssetStatus.Available
        };

        _dbContext.Laptops.Add(laptop);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Laptop {AssetId} created (Serial {Serial}).", laptop.Id, laptop.SerialNumber);

        return await GetDetailsAsync(laptop.Id, ct);
    }

    public async Task<AssetDetailsDto> CreateDesktopPcAsync(CreateDesktopPcRequestDto request, CancellationToken ct = default)
    {
        var desktopPc = new DesktopPc
        {
            SerialNumber = request.SerialNumber,
            Brand = request.Brand,
            Model = request.Model,
            CPU = request.Cpu,
            GPU = request.Gpu,
            RAM = request.Ram,
            Status = AssetStatus.Available
        };

        _dbContext.DesktopPcs.Add(desktopPc);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Desktop PC {AssetId} created (Serial {Serial}).", desktopPc.Id, desktopPc.SerialNumber);

        return await GetDetailsAsync(desktopPc.Id, ct);
    }

    public async Task<AssetDetailsDto> CreateMonitorAsync(CreateMonitorRequestDto request, CancellationToken ct = default)
    {
        var monitor = new Monitor
        {
            SerialNumber = NormalizeSerial(request.SerialNumber),
            Brand = request.Brand,
            Resolution = request.Resolution,
            RefreshRate = request.RefreshRate,
            Size = request.Size,
            Status = AssetStatus.Available
        };

        _dbContext.Monitors.Add(monitor);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Monitor {AssetId} created.", monitor.Id);

        return await GetDetailsAsync(monitor.Id, ct);
    }

    public async Task<AssetDetailsDto> CreateDockAsync(CreateDockRequestDto request, CancellationToken ct = default)
    {
        var dock = new Dock
        {
            SerialNumber = NormalizeSerial(request.SerialNumber),
            Brand = request.Brand,
            Status = AssetStatus.Available
        };

        _dbContext.Docks.Add(dock);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Dock {AssetId} created.", dock.Id);

        return await GetDetailsAsync(dock.Id, ct);
    }

    public async Task<AssetDetailsDto> CreateKeyboardMouseSetAsync(CreateKeyboardMouseSetRequestDto request, CancellationToken ct = default)
    {
        var set = new KeyboardMouseSet
        {
            SerialNumber = NormalizeSerial(request.SerialNumber),
            Brand = request.Brand,
            ConnectionType = request.ConnectionType,
            Status = AssetStatus.Available
        };

        _dbContext.KeyboardMouseSets.Add(set);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("KeyboardMouseSet {AssetId} created.", set.Id);

        return await GetDetailsAsync(set.Id, ct);
    }

    public async Task<AssetDetailsDto> CreateHeadsetAsync(CreateHeadsetRequestDto request, CancellationToken ct = default)
    {
        var headset = new Headset
        {
            SerialNumber = NormalizeSerial(request.SerialNumber),
            Brand = request.Brand,
            ConnectionType = request.ConnectionType,
            Status = AssetStatus.Available
        };

        _dbContext.Headsets.Add(headset);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Headset {AssetId} created.", headset.Id);

        return await GetDetailsAsync(headset.Id, ct);
    }

    public async Task<AssetDetailsDto> UpdateLaptopAsync(Guid id, UpdateLaptopRequestDto request, CancellationToken ct = default)
    {
        var laptop = await _dbContext.Laptops.SingleOrDefaultAsync(l => l.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Laptop), id);

        laptop.SerialNumber = request.SerialNumber;
        laptop.Brand = request.Brand;
        laptop.Model = request.Model;
        laptop.CPU = request.Cpu;
        laptop.GPU = request.Gpu;
        laptop.RAM = request.Ram;

        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Laptop {AssetId} updated.", id);

        return await GetDetailsAsync(id, ct);
    }

    public async Task<AssetDetailsDto> UpdateDesktopPcAsync(Guid id, UpdateDesktopPcRequestDto request, CancellationToken ct = default)
    {
        var desktopPc = await _dbContext.DesktopPcs.SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(DesktopPc), id);

        desktopPc.SerialNumber = request.SerialNumber;
        desktopPc.Brand = request.Brand;
        desktopPc.Model = request.Model;
        desktopPc.CPU = request.Cpu;
        desktopPc.GPU = request.Gpu;
        desktopPc.RAM = request.Ram;

        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Desktop PC {AssetId} updated.", id);

        return await GetDetailsAsync(id, ct);
    }

    public async Task<AssetDetailsDto> UpdateMonitorAsync(Guid id, UpdateMonitorRequestDto request, CancellationToken ct = default)
    {
        var monitor = await _dbContext.Monitors.SingleOrDefaultAsync(m => m.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Monitor), id);

        monitor.SerialNumber = NormalizeSerial(request.SerialNumber);
        monitor.Brand = request.Brand;
        monitor.Resolution = request.Resolution;
        monitor.RefreshRate = request.RefreshRate;
        monitor.Size = request.Size;

        await SaveWithSerialGuardAsync(ct);
        return await GetDetailsAsync(id, ct);
    }

    public async Task<AssetDetailsDto> UpdateDockAsync(Guid id, UpdateDockRequestDto request, CancellationToken ct = default)
    {
        var dock = await _dbContext.Docks.SingleOrDefaultAsync(d => d.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Dock), id);

        dock.SerialNumber = NormalizeSerial(request.SerialNumber);
        dock.Brand = request.Brand;

        await SaveWithSerialGuardAsync(ct);
        return await GetDetailsAsync(id, ct);
    }

    public async Task<AssetDetailsDto> UpdateKeyboardMouseSetAsync(Guid id, UpdateKeyboardMouseSetRequestDto request, CancellationToken ct = default)
    {
        var set = await _dbContext.KeyboardMouseSets.SingleOrDefaultAsync(k => k.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(KeyboardMouseSet), id);

        set.SerialNumber = NormalizeSerial(request.SerialNumber);
        set.Brand = request.Brand;
        set.ConnectionType = request.ConnectionType;

        await SaveWithSerialGuardAsync(ct);
        return await GetDetailsAsync(id, ct);
    }

    public async Task<AssetDetailsDto> UpdateHeadsetAsync(Guid id, UpdateHeadsetRequestDto request, CancellationToken ct = default)
    {
        var headset = await _dbContext.Headsets.SingleOrDefaultAsync(h => h.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Headset), id);

        headset.SerialNumber = NormalizeSerial(request.SerialNumber);
        headset.Brand = request.Brand;
        headset.ConnectionType = request.ConnectionType;

        await SaveWithSerialGuardAsync(ct);
        return await GetDetailsAsync(id, ct);
    }

    public async Task<AssetDetailsDto> GetDetailsAsync(Guid id, CancellationToken ct = default)
    {
        var asset = await _dbContext.Assets
            .AsNoTracking()
            .Include(a => a.AssetAssignments.Where(a => a.UnassignedAt == null))
                .ThenInclude(a => a.Employee)
            .SingleOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Asset), id);

        var storageDevices = new List<StorageDto>();

        if (asset is Laptop laptop)
        {
            storageDevices = await _dbContext.StorageDevices
                .AsNoTracking()
                .Where(s => s.LaptopId == laptop.Id)
                .Select(s => new StorageDto(s.Id, s.SerialNumber, s.Capacity, s.StorageType, s.StorageUnit, s.LaptopId, s.DesktopPcId))
                .ToListAsync(ct);
        }
        else if (asset is DesktopPc desktopPc)
        {
            storageDevices = await _dbContext.StorageDevices
                .AsNoTracking()
                .Where(s => s.DesktopPcId == desktopPc.Id)
                .Select(s => new StorageDto(s.Id, s.SerialNumber, s.Capacity, s.StorageType, s.StorageUnit, s.LaptopId, s.DesktopPcId))
                .ToListAsync(ct);
        }

        return MapDetails(asset, storageDevices);
    }

    public async Task<AssetDetailsDto> GetDetailsForViewerAsync(Guid id, CancellationToken ct = default)
    {
        var isAdmin = _currentUserService.Role == RoleConstants.ItAdmin;

        if (!isAdmin)
        {
            var userId = _currentUserService.UserId
                ?? throw new UnauthorizedException("You must be authenticated.");

            var everAssignedToViewer = await _dbContext.AssetAssignments
                .AnyAsync(a => a.AssetId == id && a.EmployeeId == userId, ct);

            if (!everAssignedToViewer)
            {
                throw new ForbiddenException("You can only view assets that are or were assigned to you.");
            }
        }

        return await GetDetailsAsync(id, ct);
    }

    public async Task<PagedResult<AssetListItemDto>> GetPagedAsync(GetAssetsQuery query, CancellationToken ct = default)
    {
        IQueryable<Asset> assets = _dbContext.Assets.AsNoTracking();

        if (query.AssetType.HasValue)
        {
            assets = assets.Where(a => a.AssetType == query.AssetType.Value);
        }

        if (query.Status.HasValue)
        {
            assets = assets.Where(a => a.Status == query.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();

            assets = assets.Where(a =>
                (a is Laptop &&
                    (((Laptop)a).SerialNumber.ToLower().Contains(term)
                     || ((Laptop)a).Brand.ToLower().Contains(term)
                     || ((Laptop)a).Model.ToLower().Contains(term)))
                || (a is DesktopPc &&
                    (((DesktopPc)a).SerialNumber.ToLower().Contains(term)
                     || ((DesktopPc)a).Brand.ToLower().Contains(term)
                     || ((DesktopPc)a).Model.ToLower().Contains(term)))
                || (a is Monitor &&
                    (((Monitor)a).Brand.ToLower().Contains(term)
                     || (((Monitor)a).SerialNumber != null && ((Monitor)a).SerialNumber!.ToLower().Contains(term))))
                || (a is Dock &&
                    (((Dock)a).Brand.ToLower().Contains(term)
                     || (((Dock)a).SerialNumber != null && ((Dock)a).SerialNumber!.ToLower().Contains(term))))
                || (a is KeyboardMouseSet &&
                    (((KeyboardMouseSet)a).Brand.ToLower().Contains(term)
                     || (((KeyboardMouseSet)a).SerialNumber != null && ((KeyboardMouseSet)a).SerialNumber!.ToLower().Contains(term))))
                || (a is Headset &&
                    (((Headset)a).Brand.ToLower().Contains(term)
                     || (((Headset)a).SerialNumber != null && ((Headset)a).SerialNumber!.ToLower().Contains(term)))));
        }

        var totalCount = await assets.CountAsync(ct);

        var items = await assets
            .Include(a => a.AssetAssignments.Where(x => x.UnassignedAt == null))
                .ThenInclude(x => x.Employee)
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResult<AssetListItemDto>(
            items.Select(MapListItem).ToList(),
            query.PageNumber,
            query.PageSize,
            totalCount);
    }

    public async Task<AssetDetailsDto> UpdateStatusAsync(Guid id, UpdateAssetStatusRequestDto request, CancellationToken ct = default)
    {
        var asset = await _dbContext.Assets
            .Include(a => a.AssetAssignments.Where(x => x.UnassignedAt == null))
            .SingleOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Asset), id);

        if (request.Status == AssetStatus.Assigned)
        {
            throw new BusinessRuleViolationException(
                "Assets cannot be manually set to Assigned. Use the assignment endpoint instead.");
        }

        if (request.Status == AssetStatus.Available && asset.AssetAssignments.Any())
        {
            throw new BusinessRuleViolationException(
                "Asset is currently assigned to an employee. Unassign it before marking it Available.");
        }

        asset.Status = request.Status;
        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Asset {AssetId} status changed to {Status}.", id, request.Status);

        return await GetDetailsAsync(id, ct);
    }

    public async Task<StorageDto> GetStorageByIdAsync(Guid id, CancellationToken ct = default)
    {
        var storage = await _dbContext.StorageDevices
            .AsNoTracking()
            .SingleOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Storage), id);

        return new StorageDto(storage.Id, storage.SerialNumber, storage.Capacity,
            storage.StorageType, storage.StorageUnit, storage.LaptopId, storage.DesktopPcId);
    }

    public async Task<PagedResult<StorageDto>> GetStoragePagedAsync(GetStorageQuery query, CancellationToken ct = default)
    {
        IQueryable<Storage> storage = _dbContext.StorageDevices.AsNoTracking();

        if (query.StorageType.HasValue)
        {
            storage = storage.Where(s => s.StorageType == query.StorageType.Value);
        }

        if (query.UnassignedOnly)
        {
            storage = storage.Where(s => s.LaptopId == null && s.DesktopPcId == null);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim().ToLower();
            storage = storage.Where(s => s.SerialNumber.ToLower().Contains(term));
        }

        var totalCount = await storage.CountAsync(ct);

        var items = await storage
            .OrderByDescending(s => s.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedResult<StorageDto>(
            items.Select(s => new StorageDto(s.Id, s.SerialNumber, s.Capacity,
                s.StorageType, s.StorageUnit, s.LaptopId, s.DesktopPcId)).ToList(),
            query.PageNumber,
            query.PageSize,
            totalCount);
    }

    public async Task<StorageDto> CreateStorageAsync(CreateStorageRequestDto request, CancellationToken ct = default)
    {
        await ValidateStorageParentAsync(request.LaptopId, request.DesktopPcId, ct);

        var storage = new Storage
        {
            SerialNumber = request.SerialNumber,
            Capacity = request.Capacity,
            StorageType = request.StorageType,
            StorageUnit = request.StorageUnit,
            LaptopId = request.LaptopId,
            DesktopPcId = request.DesktopPcId
        };

        _dbContext.StorageDevices.Add(storage);
        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Storage {StorageId} created.", storage.Id);

        return new StorageDto(storage.Id, storage.SerialNumber, storage.Capacity,
            storage.StorageType, storage.StorageUnit, storage.LaptopId, storage.DesktopPcId);
    }

    public async Task<StorageDto> UpdateStorageAsync(Guid id, UpdateStorageRequestDto request, CancellationToken ct = default)
    {
        var storage = await _dbContext.StorageDevices.SingleOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Storage), id);

        if (!storage.SerialNumber.Equals(request.SerialNumber, StringComparison.OrdinalIgnoreCase) &&
            await _dbContext.StorageDevices.AnyAsync(s => s.SerialNumber == request.SerialNumber && s.Id != id, ct))
        {
            throw new BusinessRuleViolationException("A storage device with this serial number already exists.");
        }

        await ValidateStorageParentAsync(request.LaptopId, request.DesktopPcId, ct);

        storage.SerialNumber = request.SerialNumber;
        storage.Capacity = request.Capacity;
        storage.StorageType = request.StorageType;
        storage.StorageUnit = request.StorageUnit;
        storage.LaptopId = request.LaptopId;
        storage.DesktopPcId = request.DesktopPcId;

        await SaveWithSerialGuardAsync(ct);
        _logger.LogInformation("Storage {StorageId} updated.", id);

        return new StorageDto(storage.Id, storage.SerialNumber, storage.Capacity,
            storage.StorageType, storage.StorageUnit, storage.LaptopId, storage.DesktopPcId);
    }


    public async Task DeleteStorageAsync(Guid id, CancellationToken ct = default)
    {
        var storage = await _dbContext.StorageDevices.SingleOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Storage), id);

        _dbContext.StorageDevices.Remove(storage);
        await _dbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Storage {StorageId} deleted.", id);
    }

    public async Task HardDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var asset = await _dbContext.Assets.SingleOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Asset), id);

        var ticketIds = await _dbContext.Tickets
            .Where(t => t.AssetId == id)
            .Select(t => (Guid?)t.Id)
            .ToListAsync(ct);

        var repairIds = await _dbContext.RepairHistories
            .Where(r => r.AssetId == id || ticketIds.Contains(r.TicketId))
            .Select(r => (Guid?)r.Id)
            .ToListAsync(ct);

        var attachments = await _dbContext.Attachments
            .Where(a => a.AssetId == id
                || ticketIds.Contains(a.TicketId)
                || repairIds.Contains(a.RepairHistoryId))
            .ToListAsync(ct);

        // Physical files have no FK constraints, so remove them before the DB rows are deleted.
        foreach (var attachment in attachments)
        {
            await _fileStorage.DeleteAsync(attachment.FilePath, ct);
        }

        var repairs = await _dbContext.RepairHistories
            .Where(r => repairIds.Contains(r.Id))
            .ToListAsync(ct);

        var tickets = await _dbContext.Tickets
            .Where(t => ticketIds.Contains(t.Id))
            .ToListAsync(ct);

        var assignments = await _dbContext.AssetAssignments
            .Where(a => a.AssetId == id)
            .ToListAsync(ct);

        var storage = asset is Laptop
            ? await _dbContext.StorageDevices.Where(s => s.LaptopId == id).ToListAsync(ct)
            : asset is DesktopPc
                ? await _dbContext.StorageDevices.Where(s => s.DesktopPcId == id).ToListAsync(ct)
                : new List<Storage>();

        _dbContext.Attachments.RemoveRange(attachments);
        _dbContext.RepairHistories.RemoveRange(repairs);
        _dbContext.Tickets.RemoveRange(tickets);
        _dbContext.AssetAssignments.RemoveRange(assignments);
        _dbContext.StorageDevices.RemoveRange(storage);
        _dbContext.Assets.Remove(asset);

        await _dbContext.SaveChangesAsync(ct);

        _logger.LogWarning(
            "Asset {AssetId} HARD DELETED with cascade: {Tickets} ticket(s), {Repairs} repair(s), " +
            "{Assignments} assignment(s), {Storage} storage(s), {Attachments} attachment(s) removed.",
            id, tickets.Count, repairs.Count, assignments.Count, storage.Count, attachments.Count);
    }


    private static AssetDetailsDto MapDetails(Asset asset, IReadOnlyList<StorageDto> storageDevices)
    {
        var current = asset.AssetAssignments.FirstOrDefault();

        // "current" is always an active assignment (loaded via the UnassignedAt == null filter
        // below), and UserService.HardDeleteAsync refuses to delete a user with an active
        // assignment, so EmployeeId/Employee are guaranteed non-null here.
        var summary = current is null
            ? null
            : new AssetAssignmentSummaryDto(
                current.Id,
                current.EmployeeId!.Value,
                current.Employee is null ? "Deleted User" : $"{current.Employee.FirstName} {current.Employee.LastName}",
                current.AssignedAt);

        var dto = new AssetDetailsDto(
            asset.Id, asset.AssetType, asset.Status, asset.CreatedAt, asset.UpdatedAt,
            null, null, null, null, null, null, null, null, null, null,
            storageDevices, summary);

        return asset switch
        {
            Laptop l => dto with
            {
                SerialNumber = l.SerialNumber,
                Brand = l.Brand,
                Model = l.Model,
                Cpu = l.CPU,
                Gpu = l.GPU,
                Ram = l.RAM
            },
            DesktopPc p => dto with
            {
                SerialNumber = p.SerialNumber,
                Brand = p.Brand,
                Model = p.Model,
                Cpu = p.CPU,
                Gpu = p.GPU,
                Ram = p.RAM
            },
            Monitor m => dto with
            {
                SerialNumber = m.SerialNumber,
                Brand = m.Brand,
                Resolution = m.Resolution,
                RefreshRate = m.RefreshRate,
                Size = m.Size
            },
            Dock d => dto with { SerialNumber = d.SerialNumber, Brand = d.Brand },
            KeyboardMouseSet k => dto with { SerialNumber = k.SerialNumber, Brand = k.Brand, ConnectionType = k.ConnectionType },
            Headset h => dto with { SerialNumber = h.SerialNumber, Brand = h.Brand, ConnectionType = h.ConnectionType },
            _ => dto
        };
    }

    private static AssetListItemDto MapListItem(Asset asset)
    {
        var (brand, model, serial) = asset switch
        {
            Laptop l => (l.Brand, l.Model, l.SerialNumber),
            DesktopPc p => (p.Brand, p.Model, p.SerialNumber),
            Monitor m => (m.Brand, m.Resolution, m.SerialNumber),
            Dock d => (d.Brand, (string?)null, d.SerialNumber),
            KeyboardMouseSet k => (k.Brand, (string?)null, k.SerialNumber),
            Headset h => (h.Brand, (string?)null, h.SerialNumber),
            _ => ((string?)null, (string?)null, (string?)null)
        };

        var employee = asset.AssetAssignments.FirstOrDefault()?.Employee;

        return new AssetListItemDto(
            asset.Id, asset.AssetType, asset.Status, brand, model, serial,
            employee is null ? null : $"{employee.FirstName} {employee.LastName}",
            asset.CreatedAt);
    }

    private async Task ValidateStorageParentAsync(Guid? laptopId, Guid? desktopPcId, CancellationToken ct)
    {
        if (laptopId.HasValue && !await _dbContext.Laptops.AnyAsync(l => l.Id == laptopId.Value, ct))
        {
            throw new EntityNotFoundException(nameof(Laptop), laptopId.Value);
        }

        if (desktopPcId.HasValue && !await _dbContext.DesktopPcs.AnyAsync(p => p.Id == desktopPcId.Value, ct))
        {
            throw new EntityNotFoundException(nameof(DesktopPc), desktopPcId.Value);
        }
    }

    // Collapses a blank/whitespace-only optional serial number to null so it's excluded by the
    // filtered unique index (multiple assets with "no serial" shouldn't collide with each other
    // or with a literal empty string), and so it renders as "not set" rather than a blank value.
    private static string? NormalizeSerial(string? serialNumber) =>
        string.IsNullOrWhiteSpace(serialNumber) ? null : serialNumber.Trim();

    private async Task SaveWithSerialGuardAsync(CancellationToken ct)
    {
        try
        {
            await _dbContext.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("SerialNumber") == true)
        {
            throw new BusinessRuleViolationException("An asset with this serial number already exists.");
        }
    }
}