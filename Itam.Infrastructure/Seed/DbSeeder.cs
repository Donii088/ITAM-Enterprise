using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Itam.Infrastructure.Seed;

public static class DbSeeder
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync())
        {
            return;
        }

        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher>();
        var logger = serviceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var adminEmail = configuration["SeedSettings:AdminEmail"] ?? "admin@company.com";
        var adminPassword = configuration["SeedSettings:AdminPassword"] ?? "ChangeMe!2024";

        var admin = new User
        {
            FirstName = configuration["SeedSettings:AdminFirstName"] ?? "System",
            LastName = configuration["SeedSettings:AdminLastName"] ?? "Administrator",
            Email = adminEmail,
            JobTitle = "IT Administrator",
            Role = Role.ItAdmin,
            IsActive = true,
            PasswordHash = passwordHasher.Hash(adminPassword)
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded default IT Admin account {Email}.", adminEmail);
    }
}