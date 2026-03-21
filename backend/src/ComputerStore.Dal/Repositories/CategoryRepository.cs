using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class CategoryRepository(ComputerStoreDbContext context) : ICategoryRepository
{
    public Task<List<Category>> GetAllAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = context.Categories.AsNoTracking().AsQueryable();
        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return query.OrderBy(x => x.Name).ToListAsync(cancellationToken);
    }

    public Task<Category?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => context.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedName = name.Trim().ToLowerInvariant();
        return context.Categories.AnyAsync(
            x => x.Name.ToLower() == normalizedName && (!excludeId.HasValue || x.Id != excludeId.Value),
            cancellationToken);
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken = default)
        => context.Categories.AddAsync(category, cancellationToken).AsTask();
}
