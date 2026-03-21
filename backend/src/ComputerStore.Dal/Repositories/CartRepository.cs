using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class CartRepository(ComputerStoreDbContext context) : ICartRepository
{
    public Task<List<Cart>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        => context.Carts
            .Include(x => x.Product)
            .ThenInclude(x => x!.Category)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<Cart?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => context.Carts
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Cart?> GetByUserAndProductAsync(int userId, int productId, CancellationToken cancellationToken = default)
        => context.Carts
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId, cancellationToken);

    public Task AddAsync(Cart cartItem, CancellationToken cancellationToken = default)
        => context.Carts.AddAsync(cartItem, cancellationToken).AsTask();

    public void Remove(Cart cartItem) => context.Carts.Remove(cartItem);

    public void RemoveRange(IEnumerable<Cart> cartItems) => context.Carts.RemoveRange(cartItems);
}
