namespace Itam.Application.Responses;

public class ApiResponse<TData>
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public IReadOnlyList<string> Errors { get; init; } = Array.Empty<string>();
    public TData? Data { get; init; }
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
}

public sealed class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok(string message = "Operation completed successfully.")
        => new() { Success = true, Message = message };

    public static ApiResponse<TData> Ok<TData>(TData data, string message = "Operation completed successfully.")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse Fail(string message, IReadOnlyList<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors ?? Array.Empty<string>() };
}