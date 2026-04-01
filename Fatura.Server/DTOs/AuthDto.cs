namespace Fatura.Server.DTOs;

/// <summary>
/// DTO para registro de novo usuário.
/// </summary>
public class RegisterRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// DTO para login de usuário.
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// DTO de resposta de autenticação com token JWT.
/// </summary>
public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// DTO com os dados do usuário autenticado.
/// </summary>
public class UserProfileResponse
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// DTO para atualização dos dados do usuário autenticado.
/// </summary>
public class UpdateProfileRequest
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class UpdateProfileResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public AuthResponse? Response { get; set; }
}
