using ComputerStore.Bll.Dtos.Auth;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Route("api/auth")]
public class AuthController(IAuthService authService) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
        => Ok(await authService.RegisterAsync(request, cancellationToken));

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        => Ok(await authService.LoginAsync(request, cancellationToken));

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> Me(CancellationToken cancellationToken)
        => Ok(await authService.GetProfileAsync(CurrentUserId, cancellationToken));

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
        => Ok(await authService.UpdateProfileAsync(CurrentUserId, request, cancellationToken));

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await authService.ChangePasswordAsync(CurrentUserId, request, cancellationToken);
        return NoContent();
    }
}
