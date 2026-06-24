namespace ComputerStore.Dal.Entities;

public class ProductAttribute
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string AttributeName { get; set; } = string.Empty;
    public string AttributeValue { get; set; } = string.Empty;

    public Product? Product { get; set; }
}
