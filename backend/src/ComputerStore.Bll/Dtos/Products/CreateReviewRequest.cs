using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Products;

public class CreateReviewRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
}
