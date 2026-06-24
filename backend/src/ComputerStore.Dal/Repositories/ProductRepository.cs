using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using ComputerStore.Dal.QueryObjects;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class ProductRepository(ComputerStoreDbContext context) : IProductRepository
{
    public async Task<(List<Product> Items, int TotalCount)> GetPagedAsync(ProductQueryOptions options, CancellationToken cancellationToken = default)
    {
        var page = options.Page < 1 ? 1 : options.Page;
        var pageSize = options.PageSize <= 0 ? 8 : options.PageSize;

        var query = context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .AsQueryable();

        if (!options.IncludeDeleted)
        {
            query = query.Where(x => !x.IsDeleted && x.Category != null && !x.Category.IsDeleted);
        }

        if (!string.IsNullOrWhiteSpace(options.SearchTerm))
        {
            var searchTerm = options.SearchTerm.Trim().ToLowerInvariant();
            query = query.Where(x => x.Name.ToLower().Contains(searchTerm) || x.Brand.ToLower().Contains(searchTerm));
        }

        if (options.CategoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == options.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(options.Brand))
        {
            var brand = options.Brand.Trim().ToLowerInvariant();
            query = query.Where(x => x.Brand.ToLower() == brand);
        }

        if (options.MinPrice.HasValue)
        {
            query = query.Where(x => x.Price >= options.MinPrice.Value);
        }

        if (options.MaxPrice.HasValue)
        {
            query = query.Where(x => x.Price <= options.MaxPrice.Value);
        }

        if (options.InStock.HasValue)
        {
            query = options.InStock.Value
                ? query.Where(x => x.StockQuantity > 0)
                : query.Where(x => x.StockQuantity <= 0);
        }

        query = options.SortBy?.Trim().ToLowerInvariant() switch
        {
            "price_asc" => query.OrderBy(x => x.Price),
            "price_desc" => query.OrderByDescending(x => x.Price),
            "newest" => query.OrderByDescending(x => x.CreatedAt),
            _ => query.OrderByDescending(x => x.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Product?> GetByIdAsync(int id, bool includeCategory = true, CancellationToken cancellationToken = default)
    {
        var query = context.Products.AsQueryable();
        if (includeCategory)
        {
            query = query.Include(x => x.Category);
        }

        return await query
            .Include(x => x.Images.OrderBy(i => i.DisplayOrder))
            .Include(x => x.Attributes)
            .Include(x => x.Reviews.OrderByDescending(r => r.CreatedAt))
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<List<string>> GetBrandsAsync(CancellationToken cancellationToken = default)
        => context.Products
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .Select(x => x.Brand)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync(cancellationToken);

    public Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedName = name.Trim().ToLowerInvariant();
        return context.Products.AnyAsync(
            x => x.Name.ToLower() == normalizedName && (!excludeId.HasValue || x.Id != excludeId.Value),
            cancellationToken);
    }

    public Task<int> CountActiveAsync(CancellationToken cancellationToken = default)
        => context.Products.CountAsync(x => !x.IsDeleted, cancellationToken);

    public Task AddAsync(Product product, CancellationToken cancellationToken = default)
        => context.Products.AddAsync(product, cancellationToken).AsTask();

    public Task<List<Product>> GetVariantsByGroupIdAsync(string productGroupId, CancellationToken cancellationToken = default)
    {
        return context.Products
            .AsNoTracking()
            .Where(x => x.ProductGroupId == productGroupId && !x.IsDeleted)
            .OrderBy(x => x.Price)
            .ToListAsync(cancellationToken);
    }
}
