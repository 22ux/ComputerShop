using ComputerStore.Bll.Dtos.Auth;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using ComputerStore.Dal.Utilities;

namespace ComputerStore.Bll.Services;

public class AuthService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    ITokenService tokenService,
    IUnitOfWork unitOfWork) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await userRepository.EmailExistsAsync(request.Email, cancellationToken: cancellationToken))
        {
            throw new AppException("Email da ton tai.");
        }

        var customerRole = await roleRepository.GetByNameAsync("Customer", cancellationToken)
            ?? throw new AppException("Khong tim thay role Customer.", 500);

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = PasswordHasher.Hash(request.Password),
            Phone = request.Phone.Trim(),
            Address = request.Address.Trim(),
            RoleId = customerRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        user.Role = customerRole;
        return BuildAuthResponse(user, customerRole.Name);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, includeRole: true, cancellationToken)
            ?? throw new AppException("Sai email hoac mat khau.", 401);

        if (!user.IsActive)
        {
            throw new AppException("Tai khoan da bi khoa.", 403);
        }

        if (!PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new AppException("Sai email hoac mat khau.", 401);
        }

        return BuildAuthResponse(user, user.Role?.Name ?? "Customer");
    }

    public async Task<UserProfileDto> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        return MapProfile(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);
        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone.Trim();
        user.Address = request.Address.Trim();

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return MapProfile(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await GetUserAsync(userId, cancellationToken);

        if (!PasswordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new AppException("Mat khau hien tai khong dung.");
        }

        user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<User> GetUserAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, includeRole: true, cancellationToken)
            ?? throw new AppException("Nguoi dung khong ton tai.", 404);

        if (!user.IsActive)
        {
            throw new AppException("Tai khoan da bi khoa.", 403);
        }

        return user;
    }

    private AuthResponse BuildAuthResponse(User user, string roleName)
    {
        var (token, expiresAt) = tokenService.GenerateToken(user, roleName);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            User = MapProfile(user)
        };
    }

    private static UserProfileDto MapProfile(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Phone = user.Phone,
        Address = user.Address,
        Role = user.Role?.Name ?? string.Empty,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
