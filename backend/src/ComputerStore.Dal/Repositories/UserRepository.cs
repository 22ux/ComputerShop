using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class UserRepository(ComputerStoreDbContext context) : IUserRepository
{
    public async Task<User?> GetByIdAsync(int id, bool includeRole = false, CancellationToken cancellationToken = default)
    {
        var query = context.Users.AsQueryable();
        if (includeRole)
        {
            query = query.Include(x => x.Role);
        }

        return await query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<User?> GetUserWithOrdersAsync(int id, CancellationToken cancellationToken = default)
        => context.Users
            .Include(x => x.Role)
            .Include(x => x.Orders)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<User?> GetByEmailAsync(string email, bool includeRole = false, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var query = context.Users.AsQueryable();
        if (includeRole)
        {
            query = query.Include(x => x.Role);
        }

        return await query.FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail, cancellationToken);
    }

    public Task<bool> EmailExistsAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return context.Users.AnyAsync(
            x => x.Email.ToLower() == normalizedEmail && (!excludeId.HasValue || x.Id != excludeId.Value),
            cancellationToken);
    }

    public Task<List<User>> GetCustomersAsync(bool includeOrders = false, CancellationToken cancellationToken = default)
    {
        var query = context.Users
            .Include(x => x.Role)
            .Where(x => x.Role != null && x.Role.Name == "Customer")
            .AsQueryable();

        if (includeOrders)
        {
            query = query.Include(x => x.Orders);
        }

        return query.OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);
    }

    public Task<int> CountCustomersAsync(CancellationToken cancellationToken = default)
        => context.Users.CountAsync(x => x.Role != null && x.Role.Name == "Customer", cancellationToken);

    public Task AddAsync(User user, CancellationToken cancellationToken = default)
        => context.Users.AddAsync(user, cancellationToken).AsTask();
}
