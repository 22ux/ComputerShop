using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Categories;

public class CategoryRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(255)]
    public string Description { get; set; } = string.Empty;
}
