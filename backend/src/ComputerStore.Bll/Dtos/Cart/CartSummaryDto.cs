namespace ComputerStore.Bll.Dtos.Cart;

public class CartSummaryDto
{
    public IReadOnlyCollection<CartItemDto> Items { get; set; } = Array.Empty<CartItemDto>();
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
}
