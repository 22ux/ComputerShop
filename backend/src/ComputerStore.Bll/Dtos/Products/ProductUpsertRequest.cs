using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Products;

public class ProductUpsertRequest
{
    [Required, StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Specification { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [StringLength(255)]
    public string ImageUrl { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}
