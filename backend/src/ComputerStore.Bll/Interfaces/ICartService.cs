using ComputerStore.Bll.Dtos.Cart;

namespace ComputerStore.Bll.Interfaces;

public interface ICartService
{
    Task<CartSummaryDto> GetCartAsync(int userId, CancellationToken cancellationToken = default);
    Task<CartSummaryDto> AddAsync(int userId, AddToCartRequest request, CancellationToken cancellationToken = default);
    Task<CartSummaryDto> UpdateAsync(int userId, int cartItemId, UpdateCartItemRequest request, CancellationToken cancellationToken = default);
    Task RemoveAsync(int userId, int cartItemId, CancellationToken cancellationToken = default);
    Task ClearAsync(int userId, CancellationToken cancellationToken = default);
}
