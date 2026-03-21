using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Cart;

public class UpdateCartItemRequest
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}
