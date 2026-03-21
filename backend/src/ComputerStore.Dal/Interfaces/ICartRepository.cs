using ComputerStore.Dal.Entities;

namespace ComputerStore.Dal.Interfaces;

public interface ICartRepository
{
    Task<List<Cart>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Cart?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Cart?> GetByUserAndProductAsync(int userId, int productId, CancellationToken cancellationToken = default);
    Task AddAsync(Cart cartItem, CancellationToken cancellationToken = default);
    void Remove(Cart cartItem);
    void RemoveRange(IEnumerable<Cart> cartItems);
}
