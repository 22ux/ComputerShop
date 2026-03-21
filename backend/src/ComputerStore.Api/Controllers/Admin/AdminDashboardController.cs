using ComputerStore.Bll.Dtos.Dashboard;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/dashboard")]
public class AdminDashboardController(IDashboardService dashboardService) : BaseApiController
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary(CancellationToken cancellationToken)
        => Ok(await dashboardService.GetSummaryAsync(cancellationToken));

    [HttpGet("revenue")]
    public async Task<ActionResult<IReadOnlyCollection<RevenuePointDto>>> Revenue([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, CancellationToken cancellationToken)
        => Ok(await dashboardService.GetRevenueAsync(fromDate, toDate, cancellationToken));

    [HttpGet("top-products")]
    public async Task<ActionResult<IReadOnlyCollection<TopProductDto>>> TopProducts([FromQuery] int take = 5, CancellationToken cancellationToken = default)
        => Ok(await dashboardService.GetTopProductsAsync(take, cancellationToken));

    [HttpGet("status-breakdown")]
    public async Task<ActionResult<IReadOnlyCollection<StatusBreakdownDto>>> StatusBreakdown(CancellationToken cancellationToken)
        => Ok(await dashboardService.GetStatusBreakdownAsync(cancellationToken));
}
