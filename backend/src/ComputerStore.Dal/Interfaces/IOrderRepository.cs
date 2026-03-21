using ComputerStore.Dal.Entities;
using ComputerStore.Dal.QueryObjects;

namespace ComputerStore.Dal.Interfaces;

public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(int id, bool includeDetails = true, CancellationToken cancellationToken = default);
    Task<List<Order>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<(List<Order> Items, int TotalCount)> GetPagedAsync(OrderQueryOptions options, CancellationToken cancellationToken = default);
    Task<List<Order>> GetRecentAsync(int take, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<decimal> GetRevenueAsync(DateTime? start, DateTime? end, CancellationToken cancellationToken = default);
    Task<List<RevenuePointResult>> GetRevenueSeriesAsync(DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<List<TopProductResult>> GetTopProductsAsync(int take, CancellationToken cancellationToken = default);
    Task<List<StatusCountResult>> GetStatusCountsAsync(CancellationToken cancellationToken = default);
}
