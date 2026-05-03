namespace Fatura.Server.Services;

public class ServiceResult
{
    public bool Success { get; init; }
    public bool NotFound { get; init; }
    public string? Error { get; init; }

    public static ServiceResult Ok() => new() { Success = true };

    public static ServiceResult Invalid(string error) => new() { Error = error };

    public static ServiceResult NotFoundResult(string error) => new() { NotFound = true, Error = error };
}

public class ServiceResult<T>
{
    public bool Success { get; init; }
    public bool NotFound { get; init; }
    public string? Error { get; init; }
    public T? Data { get; init; }

    public static ServiceResult<T> Ok(T data) => new() { Success = true, Data = data };

    public static ServiceResult<T> Invalid(string error) => new() { Error = error };

    public static ServiceResult<T> NotFoundResult(string error) => new() { NotFound = true, Error = error };
}