using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Fatura.Server.Data;
using Fatura.Server.DTOs;
using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Fatura.Server.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    /// <summary>
    /// Registra um novo usuário com senha hash e retorna o token JWT.
    /// </summary>
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (existingUser)
            return null;

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = GenerateToken(user),
            Nome = user.Nome,
            Email = user.Email
        };
    }

    /// <summary>
    /// Autentica um usuário existente e retorna o token JWT.
    /// </summary>
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return new AuthResponse
        {
            Token = GenerateToken(user),
            Nome = user.Nome,
            Email = user.Email
        };
    }

    public async Task<UserProfileResponse?> GetProfileAsync(int userId)
    {
        return await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileResponse
            {
                Nome = u.Nome,
                Email = u.Email
            }).FirstOrDefaultAsync();
    }

    public async Task<UpdateProfileResult> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return new UpdateProfileResult
            {
                ErrorMessage = "Usuário não encontrado."
            };
        }

        var nome = request.Nome.Trim();
        var email = request.Email.Trim();

        var emailEmUso = await _db.Users.AnyAsync(u => u.Email == email && u.Id != userId);
        if (emailEmUso)
        {
            return new UpdateProfileResult
            {
                ErrorMessage = "Já existe um usuário com este e-mail."
            };
        }

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return new UpdateProfileResult
                {
                    ErrorMessage = "A senha atual informada é inválida."
                };
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        user.Nome = nome;
        user.Email = email;

        await _db.SaveChangesAsync();

        return new UpdateProfileResult
        {
            Success = true,
            Response = new AuthResponse
            {
                Token = GenerateToken(user),
                Nome = user.Nome,
                Email = user.Email
            }
        };
    }

    /// <summary>
    /// Gera um token JWT com claims do usuário.
    /// </summary>
    private string GenerateToken(User user)
    {
        var jwtSettings = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nome),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpireHours"]!)),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
