using ComputerStore.Dal.Entities;
using ComputerStore.Dal.QueryObjects;

namespace ComputerStore.Dal.Interfaces;

public interface IProductRepository
{
    Task<(List<Product> Items, int TotalCount)> GetPagedAsync(ProductQueryOptions options, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(int id, bool includeCategory = true, CancellationToken cancellationToken = default);
    Task<List<string>> GetBrandsAsync(CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<int> CountActiveAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
    Task<List<Product>> GetVariantsByGroupIdAsync(string productGroupId, CancellationToken cancellationToken = default);
}
