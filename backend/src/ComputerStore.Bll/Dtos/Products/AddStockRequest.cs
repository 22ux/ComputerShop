using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Products;

public class AddStockRequest
{
    [Required]
    [MinLength(1, ErrorMessage = "Phai cung cap it nhat 1 so Seri.")]
    public List<string> SerialNumbers { get; set; } = new();
}
