using Itam.Application.Interfaces;
using Itam.Domain.Entities;
using Itam.Domain.Enums;
using Itam.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Itam.Infrastructure.Seed;

public static class DbSeeder
{
    private const string KnownSamplePassword = "Admin@12345";
    private const string KnownLegacySamplePassword = "ChangeMe!2024";

    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync())
        {
            return;
        }

        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var environment = serviceProvider.GetRequiredService<IHostEnvironment>();
        var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher>();
        var logger = serviceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        var adminEmail = configuration["SeedSettings:AdminEmail"] ?? "admin@company.com";
        var adminPassword = configuration["SeedSettings:AdminPassword"] ?? KnownLegacySamplePassword;

        // The sample password only ever reaches this point via the hardcoded fallback above or an
        // unchanged appsettings.json value — both mean nobody configured a real one. Refusing to
        // seed with it outside Development stops a fresh production database from ever getting a
        // publicly-known admin credential; set SeedSettings__AdminPassword to opt in for real.
        if (!environment.IsDevelopment() && adminPassword is KnownSamplePassword or KnownLegacySamplePassword)
        {
            throw new InvalidOperationException(
                "Refusing to seed the default IT Admin account with the sample placeholder password outside " +
                "the Development environment. Set a real SeedSettings:AdminPassword (e.g. via the " +
                "SeedSettings__AdminPassword environment variable) before starting the app.");
        }

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

        if (adminPassword is KnownSamplePassword or KnownLegacySamplePassword)
        {
            logger.LogWarning(
                "The seeded IT Admin account {Email} was created with the sample placeholder password. " +
                "Change this account's password immediately after first login.",
                adminEmail);
        }
    }
}