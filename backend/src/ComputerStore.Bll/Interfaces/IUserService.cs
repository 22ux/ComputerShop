using ComputerStore.Bll.Dtos.Users;

namespace ComputerStore.Bll.Interfaces;

public interface IUserService
{
    Task<IReadOnlyCollection<CustomerSummaryDto>> GetCustomersAsync(CancellationToken cancellationToken = default);
    Task<UserDetailDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<UserDetailDto> UpdateStatusAsync(int id, UpdateUserStatusRequest request, CancellationToken cancellationToken = default);
}
