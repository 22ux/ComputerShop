using ComputerStore.Bll.Dtos.Dashboard;

namespace ComputerStore.Bll.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<RevenuePointDto>> GetRevenueAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TopProductDto>> GetTopProductsAsync(int take = 5, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<StatusBreakdownDto>> GetStatusBreakdownAsync(CancellationToken cancellationToken = default);
}
