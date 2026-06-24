using ComputerStore.Dal.Entities;

namespace ComputerStore.Dal.Interfaces;

public interface IInventoryItemRepository
{
    Task AddRangeAsync(IEnumerable<InventoryItem> items, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySerialNumbersAsync(IEnumerable<string> serialNumbers, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryItem>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default);
    Task<List<InventoryItem>> GetAvailableItemsAsync(int productId, int count, CancellationToken cancellationToken = default);
    Task<List<InventoryItem>> GetByOrderDetailIdsAsync(IEnumerable<int> orderDetailIds, CancellationToken cancellationToken = default);
    Task<InventoryItem?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default);
}
