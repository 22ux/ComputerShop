using ComputerStore.Bll.Dtos.Orders;
using ComputerStore.Bll.Models;

namespace ComputerStore.Bll.Interfaces;

public interface IOrderService
{
    Task<OrderDetailDto> CreateAsync(int userId, CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderSummaryDto>> GetMineAsync(int userId, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> GetMineByIdAsync(int userId, int orderId, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> CancelAsync(int userId, int orderId, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderSummaryDto>> GetAdminOrdersAsync(OrderFilterRequest request, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> GetByIdAsync(int orderId, CancellationToken cancellationToken = default);
    Task<OrderDetailDto> UpdateStatusAsync(int orderId, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default);
}
