using System.Text.Json.Serialization;
using FluentValidation.AspNetCore;
using Itam.Application.Extensions;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Infrastructure.Extensions;
using Itam.Infrastructure.Seed;
using Itam.WebApi.BackgroundServices;
using Itam.WebApi.Configurations;
using Itam.WebApi.Middleware;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Itam.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

ValidateProductionSecrets(builder.Configuration, builder.Environment);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddHostedService<RefreshTokenCleanupService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();

        if (origins.Length > 0)
        {
            policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
        else if (builder.Environment.IsDevelopment())
        {
            // Local dev convenience only (no CorsSettings configured yet). Outside Development,
            // an empty allow-list intentionally falls closed below rather than open to any origin.
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    });
});

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(entry => entry.Value is { Errors.Count: > 0 })
                .SelectMany(entry => entry.Value!.Errors.Select(error => error.ErrorMessage))
                .ToList();

            var response = ApiResponse.Fail("One or more validation errors occurred.", errors);
            return new BadRequestObjectResult(response);
        };
    });

builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ITAM Enterprise API",
        Version = "v1",
        Description = "IT Asset Management System — assets, assignments, tickets, repairs, attachments, search and export. Protected endpoints require a JWT Bearer token.",
        Contact = new OpenApiContact { Name = "IT Department", Email = "admin@company.com" }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT access token. Swagger prefixes it with 'Bearer' automatically — paste ONLY the token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await DbSeeder.InitializeAsync(scope.ServiceProvider);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ITAM Enterprise API v1");
    });
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", async (ApplicationDbContext db) =>
{
    var healthy = await db.Database.CanConnectAsync();
    return healthy
        ? Results.Ok(new { status = "healthy" })
        : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
}).AllowAnonymous();

app.Run();

// The committed appsettings.json ships a sample JWT signing key for local development so the app
// runs out of the box. Refusing to start with it outside Development stops that sample key from
// ever protecting a real deployment — set it via the JwtSettings__Secret environment variable.
static void ValidateProductionSecrets(IConfiguration configuration, IWebHostEnvironment environment)
{
    if (environment.IsDevelopment())
    {
        return;
    }

    const string knownSampleSecret = "SuperSecretKeyForJwtTokenGenerationThatIsAtLeast32BytesLong!";
    var jwtSecret = configuration["JwtSettings:Secret"];

    if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32 || jwtSecret == knownSampleSecret)
    {
        throw new InvalidOperationException(
            "JwtSettings:Secret must be set to a unique value of at least 32 characters outside the " +
            "Development environment. Set the JwtSettings__Secret environment variable before starting the app.");
    }
}