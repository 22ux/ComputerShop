using ComputerStore.Bll.Dtos.Cart;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;

namespace ComputerStore.Bll.Services;

public class CartService(
    IUserRepository userRepository,
    IProductRepository productRepository,
    ICartRepository cartRepository,
    IUnitOfWork unitOfWork) : ICartService
{
    public async Task<CartSummaryDto> GetCartAsync(int userId, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var cartItems = await cartRepository.GetByUserIdAsync(userId, cancellationToken);
        return MapCart(cartItems);
    }

    public async Task<CartSummaryDto> AddAsync(int userId, AddToCartRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var product = await productRepository.GetByIdAsync(request.ProductId, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay san pham.", 404);

        if (product.IsDeleted || product.Category?.IsDeleted == true)
        {
            throw new AppException("San pham khong con kinh doanh.");
        }

        if (product.StockQuantity < request.Quantity)
        {
            throw new AppException("So luong vuot qua ton kho.");
        }

        var existingCartItem = await cartRepository.GetByUserAndProductAsync(userId, request.ProductId, cancellationToken);
        if (existingCartItem is null)
        {
            await cartRepository.AddAsync(new Cart
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }
        else
        {
            var newQuantity = existingCartItem.Quantity + request.Quantity;
            if (product.StockQuantity < newQuantity)
            {
                throw new AppException("So luong vuot qua ton kho.");
            }

            existingCartItem.Quantity = newQuantity;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetCartAsync(userId, cancellationToken);
    }

    public async Task<CartSummaryDto> UpdateAsync(int userId, int cartItemId, UpdateCartItemRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var cartItem = await cartRepository.GetByIdAsync(cartItemId, cancellationToken)
            ?? throw new AppException("Khong tim thay san pham trong gio.", 404);

        if (cartItem.UserId != userId)
        {
            throw new AppException("Khong co quyen truy cap gio hang nay.", 403);
        }

        if (cartItem.Product is null || cartItem.Product.StockQuantity < request.Quantity)
        {
            throw new AppException("So luong vuot qua ton kho.");
        }

        cartItem.Quantity = request.Quantity;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetCartAsync(userId, cancellationToken);
    }

    public async Task RemoveAsync(int userId, int cartItemId, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var cartItem = await cartRepository.GetByIdAsync(cartItemId, cancellationToken)
            ?? throw new AppException("Khong tim thay san pham trong gio.", 404);

        if (cartItem.UserId != userId)
        {
            throw new AppException("Khong co quyen truy cap gio hang nay.", 403);
        }

        cartRepository.Remove(cartItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearAsync(int userId, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var cartItems = await cartRepository.GetByUserIdAsync(userId, cancellationToken);
        cartRepository.RemoveRange(cartItems);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureActiveUserAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken: cancellationToken)
            ?? throw new AppException("Nguoi dung khong ton tai.", 404);

        if (!user.IsActive)
        {
            throw new AppException("Tai khoan da bi khoa.", 403);
        }
    }

    private static CartSummaryDto MapCart(IEnumerable<Cart> cartItems)
    {
        var items = cartItems.Select(item => new CartItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = item.Product?.Name ?? string.Empty,
            ImageUrl = item.Product?.ImageUrl ?? string.Empty,
            Quantity = item.Quantity,
            StockQuantity = item.Product?.StockQuantity ?? 0,
            UnitPrice = item.Product?.Price ?? 0m,
            SubTotal = item.Quantity * (item.Product?.Price ?? 0m)
        }).ToList();

        return new CartSummaryDto
        {
            Items = items,
            ItemCount = items.Sum(x => x.Quantity),
            TotalAmount = items.Sum(x => x.SubTotal)
        };
    }
}
