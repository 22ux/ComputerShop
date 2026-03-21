using ComputerStore.Bll.Dtos.Orders;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Authorize]
[Route("api/orders")]
public class OrdersController(IOrderService orderService) : BaseApiController
{
    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDetailDto>> Checkout([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
        => Ok(await orderService.CreateAsync(CurrentUserId, request, cancellationToken));

    [HttpGet("my-orders")]
    public async Task<ActionResult<IReadOnlyCollection<OrderSummaryDto>>> MyOrders(CancellationToken cancellationToken)
        => Ok(await orderService.GetMineAsync(CurrentUserId, cancellationToken));

    [HttpGet("my-orders/{id:int}")]
    public async Task<ActionResult<OrderDetailDto>> MyOrderById(int id, CancellationToken cancellationToken)
        => Ok(await orderService.GetMineByIdAsync(CurrentUserId, id, cancellationToken));

    [HttpPatch("my-orders/{id:int}/cancel")]
    public async Task<ActionResult<OrderDetailDto>> Cancel(int id, CancellationToken cancellationToken)
        => Ok(await orderService.CancelAsync(CurrentUserId, id, cancellationToken));
}
