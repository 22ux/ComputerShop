using ComputerStore.Dal.Entities;

namespace ComputerStore.Dal.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, bool includeRole = false, CancellationToken cancellationToken = default);
    Task<User?> GetUserWithOrdersAsync(int id, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, bool includeRole = false, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<List<User>> GetCustomersAsync(bool includeOrders = false, CancellationToken cancellationToken = default);
    Task<int> CountCustomersAsync(CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
