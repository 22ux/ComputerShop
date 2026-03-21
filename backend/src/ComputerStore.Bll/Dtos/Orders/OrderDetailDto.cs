namespace ComputerStore.Bll.Dtos.Orders;

public class OrderDetailDto : OrderSummaryDto
{
    public string ShippingAddress { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public IReadOnlyCollection<OrderItemDto> Items { get; set; } = Array.Empty<OrderItemDto>();
}
