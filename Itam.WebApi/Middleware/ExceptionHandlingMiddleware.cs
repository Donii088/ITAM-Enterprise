using System.Net;
using System.Text.Json;
using Itam.Application.Responses;
using Itam.Domain.Exceptions;

namespace Itam.WebApi.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            UnauthorizedException => ((int)HttpStatusCode.Unauthorized, exception.Message),
            ForbiddenException => ((int)HttpStatusCode.Forbidden, exception.Message),
            EntityNotFoundException => ((int)HttpStatusCode.NotFound, exception.Message),
            BusinessRuleViolationException => ((int)HttpStatusCode.Conflict, exception.Message),
            _ when _environment.IsDevelopment() => ((int)HttpStatusCode.InternalServerError, exception.ToString()),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
        };

        if (statusCode == (int)HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Request failed with {StatusCode}: {Message}", statusCode, exception.Message);
        }

        var response = ApiResponse.Fail(message);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }
}