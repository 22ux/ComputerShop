using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Enums;
using ComputerStore.Dal.Interfaces;
using ComputerStore.Dal.QueryObjects;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class OrderRepository(ComputerStoreDbContext context) : IOrderRepository
{
    public Task AddAsync(Order order, CancellationToken cancellationToken = default)
        => context.Orders.AddAsync(order, cancellationToken).AsTask();

    public Task<Order?> GetByIdAsync(int id, bool includeDetails = true, CancellationToken cancellationToken = default)
    {
        var query = context.Orders
            .Include(x => x.User)
            .AsQueryable();

        if (includeDetails)
        {
            query = query
                .Include(x => x.OrderDetails)
                .ThenInclude(x => x.Product);
        }

        return query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<List<Order>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        => context.Orders
            .AsNoTracking()
            .Include(x => x.OrderDetails)
            .ThenInclude(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<(List<Order> Items, int TotalCount)> GetPagedAsync(OrderQueryOptions options, CancellationToken cancellationToken = default)
    {
        var page = options.Page < 1 ? 1 : options.Page;
        var pageSize = options.PageSize <= 0 ? 10 : options.PageSize;

        var query = context.Orders
            .AsNoTracking()
            .Include(x => x.User)
            .Include(x => x.OrderDetails)
            .ThenInclude(x => x.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(options.SearchTerm))
        {
            var searchTerm = options.SearchTerm.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.ReceiverName.ToLower().Contains(searchTerm) ||
                x.ReceiverPhone.ToLower().Contains(searchTerm) ||
                (x.User != null && (x.User.FullName.ToLower().Contains(searchTerm) || x.User.Email.ToLower().Contains(searchTerm))));
        }

        if (!string.IsNullOrWhiteSpace(options.Status) &&
            Enum.TryParse<OrderStatus>(options.Status, true, out var parsedStatus))
        {
            query = query.Where(x => x.Status == parsedStatus);
        }

        if (options.FromDate.HasValue)
        {
            var start = options.FromDate.Value.Date;
            query = query.Where(x => x.CreatedAt >= start);
        }

        if (options.ToDate.HasValue)
        {
            var end = options.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(x => x.CreatedAt <= end);
        }

        query = query.OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<List<Order>> GetRecentAsync(int take, CancellationToken cancellationToken = default)
        => context.Orders
            .AsNoTracking()
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedAt)
            .Take(take)
            .ToListAsync(cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => context.Orders.CountAsync(cancellationToken);

    public async Task<decimal> GetRevenueAsync(DateTime? start, DateTime? end, CancellationToken cancellationToken = default)
    {
        var query = context.Orders.Where(x => x.Status == OrderStatus.Completed);

        if (start.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= start.Value);
        }

        if (end.HasValue)
        {
            query = query.Where(x => x.CreatedAt <= end.Value);
        }

        return await query.Select(x => (decimal?)x.TotalAmount).SumAsync(cancellationToken) ?? 0m;
    }

    public Task<List<RevenuePointResult>> GetRevenueSeriesAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default)
        => context.Orders
            .AsNoTracking()
            .Where(x => x.Status == OrderStatus.Completed && x.CreatedAt >= start && x.CreatedAt <= end)
            .GroupBy(x => x.CreatedAt.Date)
            .Select(group => new RevenuePointResult
            {
                Date = group.Key,
                Revenue = group.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Date)
            .ToListAsync(cancellationToken);

    public Task<List<TopProductResult>> GetTopProductsAsync(int take, CancellationToken cancellationToken = default)
        => context.OrderDetails
            .AsNoTracking()
            .Where(x => x.Order != null && x.Order.Status == OrderStatus.Completed)
            .GroupBy(x => new { x.ProductId, ProductName = x.Product != null ? x.Product.Name : "Unknown" })
            .Select(group => new TopProductResult
            {
                ProductName = group.Key.ProductName,
                QuantitySold = group.Sum(x => x.Quantity),
                Revenue = group.Sum(x => x.SubTotal)
            })
            .OrderByDescending(x => x.QuantitySold)
            .ThenByDescending(x => x.Revenue)
            .Take(take)
            .ToListAsync(cancellationToken);

    public Task<List<StatusCountResult>> GetStatusCountsAsync(CancellationToken cancellationToken = default)
        => context.Orders
            .AsNoTracking()
            .GroupBy(x => x.Status)
            .Select(group => new StatusCountResult
            {
                Status = group.Key,
                Count = group.Count()
            })
            .OrderBy(x => x.Status)
            .ToListAsync(cancellationToken);
}
