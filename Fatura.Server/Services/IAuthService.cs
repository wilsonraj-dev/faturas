using Fatura.Server.DTOs;

namespace Fatura.Server.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<UserProfileResponse?> GetProfileAsync(int userId);
    Task<UpdateProfileResult> UpdateProfileAsync(int userId, UpdateProfileRequest request);
}
