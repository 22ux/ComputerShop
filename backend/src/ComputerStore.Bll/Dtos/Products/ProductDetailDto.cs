namespace ComputerStore.Bll.Dtos.Products;

public class ProductDetailDto : ProductSummaryDto
{
    public string Specification { get; set; } = string.Empty;
    public float AverageRating { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductAttributeDto> Attributes { get; set; } = new();
    public List<ReviewDto> Reviews { get; set; } = new();
    public List<ProductVariantDto> Variants { get; set; } = new();
}
