using ComputerStore.Bll.Dtos.Users;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Enums;
using ComputerStore.Dal.Interfaces;

namespace ComputerStore.Bll.Services;

public class UserService(IUserRepository userRepository, IUnitOfWork unitOfWork) : IUserService
{
    public async Task<IReadOnlyCollection<CustomerSummaryDto>> GetCustomersAsync(CancellationToken cancellationToken = default)
    {
        var users = await userRepository.GetCustomersAsync(includeOrders: true, cancellationToken);

        return users.Select(user => new CustomerSummaryDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            OrderCount = user.Orders.Count,
            TotalSpent = user.Orders.Where(x => x.Status == OrderStatus.Completed).Sum(x => x.TotalAmount)
        }).ToList();
    }

    public async Task<UserDetailDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetUserWithOrdersAsync(id, cancellationToken)
            ?? throw new AppException("Khong tim thay khach hang.", 404);

        return new UserDetailDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Role = user.Role?.Name ?? string.Empty,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            OrderCount = user.Orders.Count,
            TotalSpent = user.Orders.Where(x => x.Status == OrderStatus.Completed).Sum(x => x.TotalAmount),
            LastOrderDate = user.Orders.OrderByDescending(x => x.CreatedAt).Select(x => (DateTime?)x.CreatedAt).FirstOrDefault()
        };
    }

    public async Task<UserDetailDto> UpdateStatusAsync(int id, UpdateUserStatusRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, includeRole: true, cancellationToken)
            ?? throw new AppException("Khong tim thay khach hang.", 404);

        if (user.Role?.Name == "Admin")
        {
            throw new AppException("Khong duoc khoa tai khoan admin.");
        }

        user.IsActive = request.IsActive;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
