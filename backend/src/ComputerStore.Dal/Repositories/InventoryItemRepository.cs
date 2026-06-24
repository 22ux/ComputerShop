using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class InventoryItemRepository(ComputerStoreDbContext context) : IInventoryItemRepository
{
    public async Task AddRangeAsync(IEnumerable<InventoryItem> items, CancellationToken cancellationToken = default)
    {
        await context.InventoryItems.AddRangeAsync(items, cancellationToken);
    }

    public async Task<bool> ExistsBySerialNumbersAsync(IEnumerable<string> serialNumbers, CancellationToken cancellationToken = default)
    {
        return await context.InventoryItems
            .AnyAsync(i => serialNumbers.Contains(i.SerialNumber), cancellationToken);
    }

    public async Task<IReadOnlyList<InventoryItem>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await context.InventoryItems
            .Where(i => i.ProductId == productId)
            .OrderByDescending(i => i.ImportDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<InventoryItem>> GetAvailableItemsAsync(int productId, int count, CancellationToken cancellationToken = default)
    {
        return await context.InventoryItems
            .Where(i => i.ProductId == productId && i.Status == "InStock")
            .OrderBy(i => i.ImportDate)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<InventoryItem>> GetByOrderDetailIdsAsync(IEnumerable<int> orderDetailIds, CancellationToken cancellationToken = default)
    {
        return await context.InventoryItems
            .Where(i => i.OrderDetailId.HasValue && orderDetailIds.Contains(i.OrderDetailId.Value))
            .ToListAsync(cancellationToken);
    }

    public Task<InventoryItem?> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default)
    {
        return context.InventoryItems
            .Include(x => x.Product)
            .Include(x => x.OrderDetail)
                .ThenInclude(d => d!.Order)
            .FirstOrDefaultAsync(x => x.SerialNumber == serialNumber, cancellationToken);
    }
}
