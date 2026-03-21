using ComputerStore.Dal.Entities;

namespace ComputerStore.Dal.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
}
