using Fatura.Server.DTOs;
using Fatura.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fatura.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Registra um novo usuário.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest("O nome é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("O e-mail é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return BadRequest("A senha deve ter pelo menos 6 caracteres.");

        var result = await _authService.RegisterAsync(request);
        if (result is null)
            return BadRequest("Já existe um usuário com este e-mail.");

        return Ok(result);
    }

    /// <summary>
    /// Autentica um usuário existente.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result is null)
            return Unauthorized("E-mail ou senha inválidos.");

        return Ok(result);
    }

    [Authorize]
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        var result = await _authService.GetProfileAsync(GetUserId());
        if (result is null)
            return NotFound("Usuário não encontrado.");

        return Ok(result);
    }

    [Authorize]
    [HttpPut("profile")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuthResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest("O nome é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("O e-mail é obrigatório.");

        if (!string.IsNullOrWhiteSpace(request.NewPassword) && string.IsNullOrWhiteSpace(request.CurrentPassword))
            return BadRequest("Informe a senha atual para alterar a senha.");

        if (!string.IsNullOrWhiteSpace(request.NewPassword) && request.NewPassword.Length < 6)
            return BadRequest("A nova senha deve ter pelo menos 6 caracteres.");

        var result = await _authService.UpdateProfileAsync(GetUserId(), request);
        if (!result.Success)
        {
            if (result.ErrorMessage == "Usuário não encontrado.")
                return NotFound(result.ErrorMessage);

            return BadRequest(result.ErrorMessage);
        }

        return Ok(result.Response);
    }
}
