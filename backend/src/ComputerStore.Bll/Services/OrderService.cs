using ComputerStore.Bll.Dtos.Orders;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Bll.Models;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Enums;
using ComputerStore.Dal.Interfaces;
using ComputerStore.Dal.QueryObjects;

namespace ComputerStore.Bll.Services;

public class OrderService(
    IUserRepository userRepository,
    ICartRepository cartRepository,
    IOrderRepository orderRepository,
    IInventoryItemRepository inventoryItemRepository,
    IUnitOfWork unitOfWork) : IOrderService
{
    private static readonly Dictionary<OrderStatus, OrderStatus[]> AllowedTransitions = new()
    {
        [OrderStatus.Pending] = [OrderStatus.Confirmed, OrderStatus.Cancelled],
        [OrderStatus.Confirmed] = [OrderStatus.Shipping, OrderStatus.Cancelled],
        [OrderStatus.Shipping] = [OrderStatus.Completed],
        [OrderStatus.Completed] = [],
        [OrderStatus.Cancelled] = []
    };

    public async Task<OrderDetailDto> CreateAsync(int userId, CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        var order = await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var user = await EnsureActiveUserAsync(userId, cancellationToken);
            var cartItems = await cartRepository.GetByUserIdAsync(userId, cancellationToken);
            if (cartItems.Count == 0)
            {
                throw new AppException("Gio hang dang trong.");
            }

            var paymentMethod = ParsePaymentMethod(request.PaymentMethod);

            foreach (var item in cartItems)
            {
                if (item.Product is null || item.Product.IsDeleted || item.Product.Category?.IsDeleted == true)
                {
                    throw new AppException("Co san pham trong gio khong con kinh doanh.");
                }

                if (item.Product.StockQuantity < item.Quantity)
                {
                    throw new AppException($"San pham {item.Product.Name} khong du ton kho.");
                }
            }

            var createdOrder = new Order
            {
                UserId = user.Id,
                User = user,
                ReceiverName = request.ReceiverName.Trim(),
                ReceiverPhone = request.ReceiverPhone.Trim(),
                ShippingAddress = request.ShippingAddress.Trim(),
                Note = request.Note.Trim(),
                PaymentMethod = paymentMethod,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var item in cartItems)
            {
                var availableSerials = await inventoryItemRepository.GetAvailableItemsAsync(item.ProductId, item.Quantity, cancellationToken);
                if (availableSerials.Count < item.Quantity)
                {
                    throw new AppException($"San pham {item.Product!.Name} khong du ton kho Seri.");
                }

                item.Product!.StockQuantity -= item.Quantity;
                
                var orderDetail = new OrderDetail
                {
                    ProductId = item.ProductId,
                    Product = item.Product,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product.Price,
                    SubTotal = item.Quantity * item.Product.Price
                };

                foreach (var serial in availableSerials)
                {
                    serial.Status = "Sold";
                    orderDetail.InventoryItems.Add(serial);
                }

                createdOrder.OrderDetails.Add(orderDetail);
            }

            createdOrder.TotalAmount = createdOrder.OrderDetails.Sum(x => x.SubTotal);
            await orderRepository.AddAsync(createdOrder, cancellationToken);
            cartRepository.RemoveRange(cartItems);

            return createdOrder;
        }, cancellationToken);

        return OrderMapper.ToDetailDto(order);
    }

    public async Task<IReadOnlyCollection<OrderSummaryDto>> GetMineAsync(int userId, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var orders = await orderRepository.GetByUserIdAsync(userId, cancellationToken);
        return orders.Select(OrderMapper.ToSummaryDto).ToList();
    }

    public async Task<OrderDetailDto> GetMineByIdAsync(int userId, int orderId, CancellationToken cancellationToken = default)
    {
        await EnsureActiveUserAsync(userId, cancellationToken);
        var order = await GetOrderAsync(orderId, cancellationToken);
        if (order.UserId != userId)
        {
            throw new AppException("Khong co quyen xem don hang nay.", 403);
        }

        return OrderMapper.ToDetailDto(order);
    }

    public Task<OrderDetailDto> CancelAsync(int userId, int orderId, CancellationToken cancellationToken = default)
        => unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await EnsureActiveUserAsync(userId, cancellationToken);
            var order = await GetOrderAsync(orderId, cancellationToken);

            if (order.UserId != userId)
            {
                throw new AppException("Khong co quyen huy don hang nay.", 403);
            }

            if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            {
                throw new AppException("Chi duoc huy don o trang thai Pending hoac Confirmed.");
            }

            await RestoreStockAsync(order, cancellationToken);
            order.Status = OrderStatus.Cancelled;

            return OrderMapper.ToDetailDto(order);
        }, cancellationToken);

    public async Task<PagedResult<OrderSummaryDto>> GetAdminOrdersAsync(OrderFilterRequest request, CancellationToken cancellationToken = default)
    {
        var options = new OrderQueryOptions
        {
            SearchTerm = request.SearchTerm,
            Status = request.Status,
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Page = request.Page,
            PageSize = request.PageSize
        };

        var (orders, totalCount) = await orderRepository.GetPagedAsync(options, cancellationToken);

        return new PagedResult<OrderSummaryDto>
        {
            Items = orders.Select(OrderMapper.ToSummaryDto).ToList(),
            Page = options.Page,
            PageSize = options.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)options.PageSize)
        };
    }

    public async Task<OrderDetailDto> GetByIdAsync(int orderId, CancellationToken cancellationToken = default)
        => OrderMapper.ToDetailDto(await GetOrderAsync(orderId, cancellationToken));

    public Task<OrderDetailDto> UpdateStatusAsync(int orderId, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default)
        => unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var order = await GetOrderAsync(orderId, cancellationToken);
            var newStatus = ParseOrderStatus(request.Status);

            if (order.Status == newStatus)
            {
                return OrderMapper.ToDetailDto(order);
            }

            if (!AllowedTransitions[order.Status].Contains(newStatus))
            {
                throw new AppException($"Khong the chuyen don hang tu {order.Status} sang {newStatus}.");
            }

            if (newStatus == OrderStatus.Cancelled)
            {
                await RestoreStockAsync(order, cancellationToken);
            }

            order.Status = newStatus;
            return OrderMapper.ToDetailDto(order);
        }, cancellationToken);

    private async Task<User> EnsureActiveUserAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(userId, includeRole: true, cancellationToken)
            ?? throw new AppException("Nguoi dung khong ton tai.", 404);

        if (!user.IsActive)
        {
            throw new AppException("Tai khoan da bi khoa.", 403);
        }

        return user;
    }

    private async Task<Order> GetOrderAsync(int orderId, CancellationToken cancellationToken)
        => await orderRepository.GetByIdAsync(orderId, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay don hang.", 404);

    private static PaymentMethod ParsePaymentMethod(string paymentMethod)
    {
        if (!Enum.TryParse<PaymentMethod>(paymentMethod, true, out var parsed))
        {
            throw new AppException("Phuong thuc thanh toan khong hop le.");
        }

        return parsed;
    }

    private static OrderStatus ParseOrderStatus(string status)
    {
        if (!Enum.TryParse<OrderStatus>(status, true, out var parsed))
        {
            throw new AppException("Trang thai don hang khong hop le.");
        }

        return parsed;
    }

    private async Task RestoreStockAsync(Order order, CancellationToken cancellationToken)
    {
        var orderDetailIds = order.OrderDetails.Select(d => d.Id).ToList();
        var inventoryItems = await inventoryItemRepository.GetByOrderDetailIdsAsync(orderDetailIds, cancellationToken);

        foreach (var item in inventoryItems)
        {
            item.Status = "InStock";
            item.OrderDetailId = null;
        }

        foreach (var detail in order.OrderDetails)
        {
            if (detail.Product is not null)
            {
                detail.Product.StockQuantity += detail.Quantity;
            }
        }
    }
}
