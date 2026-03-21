using ComputerStore.Bll.Dtos.Cart;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Authorize]
[Route("api/cart")]
public class CartController(ICartService cartService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<CartSummaryDto>> Get(CancellationToken cancellationToken)
        => Ok(await cartService.GetCartAsync(CurrentUserId, cancellationToken));

    [HttpPost("items")]
    public async Task<ActionResult<CartSummaryDto>> AddItem([FromBody] AddToCartRequest request, CancellationToken cancellationToken)
        => Ok(await cartService.AddAsync(CurrentUserId, request, cancellationToken));

    [HttpPut("items/{cartItemId:int}")]
    public async Task<ActionResult<CartSummaryDto>> UpdateItem(int cartItemId, [FromBody] UpdateCartItemRequest request, CancellationToken cancellationToken)
        => Ok(await cartService.UpdateAsync(CurrentUserId, cartItemId, request, cancellationToken));

    [HttpDelete("items/{cartItemId:int}")]
    public async Task<IActionResult> RemoveItem(int cartItemId, CancellationToken cancellationToken)
    {
        await cartService.RemoveAsync(CurrentUserId, cartItemId, cancellationToken);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        await cartService.ClearAsync(CurrentUserId, cancellationToken);
        return NoContent();
    }
}
