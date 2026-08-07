using FluentValidation;
using Itam.Application.Interfaces;
using Itam.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Itam.Application.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);

        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(DependencyInjectionExtensions).Assembly));
        services.AddValidatorsFromAssembly(typeof(DependencyInjectionExtensions).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAssetService, AssetService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<IRepairService, RepairService>();
        services.AddScoped<IAttachmentService, AttachmentService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IExportService, ExportService>();

        return services;
    }
}