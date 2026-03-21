namespace ComputerStore.Bll.Dtos.Orders;

public class OrderSummaryDto
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public string ReceiverPhone { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
