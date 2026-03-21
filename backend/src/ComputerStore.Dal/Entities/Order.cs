using ComputerStore.Dal.Enums;

namespace ComputerStore.Dal.Entities;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string ReceiverName { get; set; } = string.Empty;
    public string ReceiverPhone { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cod;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
