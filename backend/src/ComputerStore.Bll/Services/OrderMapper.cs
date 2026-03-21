using ComputerStore.Bll.Dtos.Orders;
using ComputerStore.Dal.Entities;

namespace ComputerStore.Bll.Services;

internal static class OrderMapper
{
    public static OrderSummaryDto ToSummaryDto(Order order) => new()
    {
        Id = order.Id,
        CustomerName = order.User?.FullName ?? string.Empty,
        CustomerEmail = order.User?.Email ?? string.Empty,
        ReceiverName = order.ReceiverName,
        ReceiverPhone = order.ReceiverPhone,
        TotalAmount = order.TotalAmount,
        Status = order.Status.ToString(),
        PaymentMethod = order.PaymentMethod.ToString(),
        ItemCount = order.OrderDetails.Sum(x => x.Quantity),
        CreatedAt = order.CreatedAt
    };

    public static OrderDetailDto ToDetailDto(Order order) => new()
    {
        Id = order.Id,
        CustomerName = order.User?.FullName ?? string.Empty,
        CustomerEmail = order.User?.Email ?? string.Empty,
        ReceiverName = order.ReceiverName,
        ReceiverPhone = order.ReceiverPhone,
        ShippingAddress = order.ShippingAddress,
        Note = order.Note,
        TotalAmount = order.TotalAmount,
        Status = order.Status.ToString(),
        PaymentMethod = order.PaymentMethod.ToString(),
        ItemCount = order.OrderDetails.Sum(x => x.Quantity),
        CreatedAt = order.CreatedAt,
        Items = order.OrderDetails.Select(x => new OrderItemDto
        {
            ProductId = x.ProductId,
            ProductName = x.Product?.Name ?? string.Empty,
            ImageUrl = x.Product?.ImageUrl ?? string.Empty,
            Quantity = x.Quantity,
            UnitPrice = x.UnitPrice,
            SubTotal = x.SubTotal
        }).ToList()
    };
}
