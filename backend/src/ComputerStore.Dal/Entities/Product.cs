namespace ComputerStore.Dal.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int WarrantyMonths { get; set; } = 24;
    public int StockQuantity { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string? ProductGroupId { get; set; }
    public string? VariantName { get; set; }
    public int CategoryId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Category? Category { get; set; }
    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public ICollection<Cart> CartItems { get; set; } = new List<Cart>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
}
