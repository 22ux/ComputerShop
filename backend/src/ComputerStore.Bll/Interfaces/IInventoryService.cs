using ComputerStore.Bll.Dtos.Products;

namespace ComputerStore.Bll.Interfaces;

public interface IInventoryService
{
    Task<IReadOnlyList<InventoryItemDto>> AddStockAsync(int productId, AddStockRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InventoryItemDto>> GetInventoryByProductIdAsync(int productId, CancellationToken cancellationToken = default);
    Task<InventoryItemDto> ChangeStatusAsync(string serialNumber, UpdateInventoryStatusRequest request, CancellationToken cancellationToken = default);
    Task<WarrantyStatusDto> CheckWarrantyAsync(string serialNumber, CancellationToken cancellationToken = default);
}
