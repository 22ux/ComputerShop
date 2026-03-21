using ComputerStore.Bll.Dtos.Dashboard;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Interfaces;

namespace ComputerStore.Bll.Services;

public class DashboardService(
    IProductRepository productRepository,
    IUserRepository userRepository,
    IOrderRepository orderRepository) : IDashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var todayEnd = todayStart.AddDays(1).AddTicks(-1);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var recentOrders = await orderRepository.GetRecentAsync(5, cancellationToken);

        return new DashboardSummaryDto
        {
            TotalProducts = await productRepository.CountActiveAsync(cancellationToken),
            TotalOrders = await orderRepository.CountAsync(cancellationToken),
            TotalCustomers = await userRepository.CountCustomersAsync(cancellationToken),
            TodayRevenue = await orderRepository.GetRevenueAsync(todayStart, todayEnd, cancellationToken),
            MonthRevenue = await orderRepository.GetRevenueAsync(monthStart, todayEnd, cancellationToken),
            RecentOrders = recentOrders.Select(OrderMapper.ToSummaryDto).ToList()
        };
    }

    public async Task<IReadOnlyCollection<RevenuePointDto>> GetRevenueAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default)
    {
        var start = (fromDate ?? DateTime.UtcNow.Date.AddDays(-6)).Date;
        var end = (toDate ?? DateTime.UtcNow.Date).Date;

        if (start > end)
        {
            throw new AppException("Ngay bat dau khong duoc lon hon ngay ket thuc.");
        }

        var revenueSeries = await orderRepository.GetRevenueSeriesAsync(start, end.AddDays(1).AddTicks(-1), cancellationToken);
        var revenueLookup = revenueSeries.ToDictionary(x => x.Date.Date, x => x.Revenue);

        var results = new List<RevenuePointDto>();
        for (var date = start; date <= end; date = date.AddDays(1))
        {
            results.Add(new RevenuePointDto
            {
                Date = date,
                Label = date.ToString("dd/MM"),
                Revenue = revenueLookup.GetValueOrDefault(date, 0m)
            });
        }

        return results;
    }

    public async Task<IReadOnlyCollection<TopProductDto>> GetTopProductsAsync(int take = 5, CancellationToken cancellationToken = default)
    {
        var results = await orderRepository.GetTopProductsAsync(take <= 0 ? 5 : take, cancellationToken);
        return results.Select(x => new TopProductDto
        {
            ProductName = x.ProductName,
            QuantitySold = x.QuantitySold,
            Revenue = x.Revenue
        }).ToList();
    }

    public async Task<IReadOnlyCollection<StatusBreakdownDto>> GetStatusBreakdownAsync(CancellationToken cancellationToken = default)
    {
        var results = await orderRepository.GetStatusCountsAsync(cancellationToken);
        return results.Select(x => new StatusBreakdownDto
        {
            Status = x.Status.ToString(),
            Count = x.Count
        }).ToList();
    }
}
