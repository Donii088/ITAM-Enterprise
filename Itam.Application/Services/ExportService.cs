using System.Text;
using Itam.Application.Common;
using Itam.Application.DTOs.Assets;
using Itam.Application.DTOs.Assignments;
using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Itam.Application.Services;

public sealed class ExportService : IExportService
{
    private const int ExportRowLimit = 10000;

    private readonly IApplicationDbContext _dbContext;
    private readonly ILogger<ExportService> _logger;

    public ExportService(IApplicationDbContext dbContext, ILogger<ExportService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<(byte[] Content, string FileName)> ExportAssetsAsync(GetAssetsQuery query, CancellationToken ct = default)
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
                (a is Laptop && (((Laptop)a).Brand.ToLower().Contains(term)
                    || ((Laptop)a).Model.ToLower().Contains(term)
                    || ((Laptop)a).SerialNumber.ToLower().Contains(term)))
                || (a is DesktopPc && (((DesktopPc)a).Brand.ToLower().Contains(term)
                    || ((DesktopPc)a).Model.ToLower().Contains(term)
                    || ((DesktopPc)a).SerialNumber.ToLower().Contains(term)))
                || (a is Monitor && (((Monitor)a).Brand.ToLower().Contains(term)
                    || ((Monitor)a).Resolution.ToLower().Contains(term)))
                || (a is Dock && ((Dock)a).Brand.ToLower().Contains(term))
                || (a is KeyboardMouseSet && ((KeyboardMouseSet)a).Brand.ToLower().Contains(term)));
        }

        var list = await assets
            .OrderByDescending(a => a.CreatedAt)
            .Take(ExportRowLimit)
            .ToListAsync(ct);

        var ids = list.Select(a => a.Id).ToList();

        var employeeByAsset = await _dbContext.AssetAssignments.AsNoTracking()
            .Where(x => ids.Contains(x.AssetId) && x.UnassignedAt == null)
            // Filtered to UnassignedAt == null (active assignments), which are guaranteed to have
            // an employee — HardDeleteAsync refuses to delete a user with an active assignment.
            .Select(x => new { x.AssetId, Name = x.Employee!.FirstName + " " + x.Employee.LastName })
            .ToDictionaryAsync(x => x.AssetId, x => x.Name, ct);

        var sb = new StringBuilder();
        sb.AppendLine("SerialNumber,Type,Brand,Model,Status,AssignedEmployee,CreatedAt");

        foreach (var asset in list)
        {
            var (brand, model, serial) = AssetSummaries.Summarize(asset);

            sb.AppendLine(string.Join(',',
                Esc(serial),
                Esc(asset.AssetType.ToString()),
                Esc(brand),
                Esc(model),
                Esc(asset.Status.ToString()),
                Esc(employeeByAsset.TryGetValue(asset.Id, out var employee) ? employee : null),
                asset.CreatedAt.ToString("yyyy-MM-dd")));
        }

        _logger.LogInformation("Assets export generated: {Rows} row(s).", list.Count);

        return (ToCsvBytes(sb), $"assets-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    public async Task<(byte[] Content, string FileName)> ExportAssignmentsAsync(GetAssignmentsQuery query, CancellationToken ct = default)
    {
        IQueryable<AssetAssignment> assignments = _dbContext.AssetAssignments.AsNoTracking();

        if (query.EmployeeId.HasValue)
        {
            assignments = assignments.Where(a => a.EmployeeId == query.EmployeeId.Value);
        }

        if (query.AssetId.HasValue)
        {
            assignments = assignments.Where(a => a.AssetId == query.AssetId.Value);
        }

        if (query.ActiveOnly)
        {
            assignments = assignments.Where(a => a.UnassignedAt == null);
        }

        var list = await assignments
            .Include(a => a.Asset)
            .Include(a => a.Employee)
            .OrderByDescending(a => a.AssignedAt)
            .Take(ExportRowLimit)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("AssetSerial,AssetType,Employee,AssignedAt,UnassignedAt,State");

        foreach (var assignment in list)
        {
            var (_, _, serial) = AssetSummaries.Summarize(assignment.Asset);

            sb.AppendLine(string.Join(',',
                Esc(serial),
                Esc(assignment.Asset.AssetType.ToString()),
                Esc(assignment.Employee is null ? "Deleted User" : $"{assignment.Employee.FirstName} {assignment.Employee.LastName}"),
                assignment.AssignedAt.ToString("yyyy-MM-dd"),
                assignment.UnassignedAt?.ToString("yyyy-MM-dd") ?? "",
                assignment.UnassignedAt == null ? "Active" : "Closed"));
        }

        _logger.LogInformation("Assignments export generated: {Rows} row(s).", list.Count);

        return (ToCsvBytes(sb), $"assignments-{DateTime.UtcNow:yyyy-MM-dd}.csv");
    }

    private static string Esc(string? value)
        => string.IsNullOrEmpty(value) ? "" : "\"" + value.Replace("\"", "\"\"") + "\"";

    private static byte[] ToCsvBytes(StringBuilder sb)
        => new UTF8Encoding(true).GetBytes(sb.ToString()); // BOM so Excel detects UTF-8
}