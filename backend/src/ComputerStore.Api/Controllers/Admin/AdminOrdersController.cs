using ComputerStore.Bll.Dtos.Orders;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Bll.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/orders")]
public class AdminOrdersController(IOrderService orderService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderSummaryDto>>> Get([FromQuery] OrderFilterRequest request, CancellationToken cancellationToken)
        => Ok(await orderService.GetAdminOrdersAsync(request, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDetailDto>> GetById(int id, CancellationToken cancellationToken)
        => Ok(await orderService.GetByIdAsync(id, cancellationToken));

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request, CancellationToken cancellationToken)
        => Ok(await orderService.UpdateStatusAsync(id, request, cancellationToken));
}
