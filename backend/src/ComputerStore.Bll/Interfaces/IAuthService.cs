using ComputerStore.Bll.Dtos.Auth;

namespace ComputerStore.Bll.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
}
