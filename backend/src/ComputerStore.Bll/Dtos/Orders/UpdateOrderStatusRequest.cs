using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Orders;

public class UpdateOrderStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
