using ComputerStore.Bll.Dtos.Orders;

namespace ComputerStore.Bll.Dtos.Dashboard;

public class DashboardSummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public int TotalCustomers { get; set; }
    public decimal TodayRevenue { get; set; }
    public decimal MonthRevenue { get; set; }
    public IReadOnlyCollection<OrderSummaryDto> RecentOrders { get; set; } = Array.Empty<OrderSummaryDto>();
}
