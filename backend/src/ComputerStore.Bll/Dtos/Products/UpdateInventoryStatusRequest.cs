using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Products;

public class UpdateInventoryStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
