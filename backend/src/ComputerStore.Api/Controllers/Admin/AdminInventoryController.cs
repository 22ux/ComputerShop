using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/products/{productId:int}/inventory")]
public class AdminInventoryController(IInventoryService inventoryService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InventoryItemDto>>> GetInventory(int productId, CancellationToken cancellationToken)
    {
        var items = await inventoryService.GetInventoryByProductIdAsync(productId, cancellationToken);
        return Ok(items);
    }

    [HttpPost("add-stock")]
    public async Task<ActionResult<IReadOnlyList<InventoryItemDto>>> AddStock(int productId, [FromBody] AddStockRequest request, CancellationToken cancellationToken)
    {
        var items = await inventoryService.AddStockAsync(productId, request, cancellationToken);
        return Ok(items);
    }

    [HttpPut("~/api/admin/inventory/{serialNumber}/status")]
    public async Task<ActionResult<InventoryItemDto>> ChangeStatus(string serialNumber, [FromBody] UpdateInventoryStatusRequest request, CancellationToken cancellationToken)
    {
        var item = await inventoryService.ChangeStatusAsync(serialNumber, request, cancellationToken);
        return Ok(item);
    }
}
