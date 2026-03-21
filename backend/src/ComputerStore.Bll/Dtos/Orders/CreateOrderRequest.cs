using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Orders;

public class CreateOrderRequest
{
    [Required, StringLength(100)]
    public string ReceiverName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string ReceiverPhone { get; set; } = string.Empty;

    [Required, StringLength(255)]
    public string ShippingAddress { get; set; } = string.Empty;

    [StringLength(255)]
    public string Note { get; set; } = string.Empty;

    [Required]
    public string PaymentMethod { get; set; } = "Cod";
}
