namespace ComputerStore.Dal.Entities;

public class InventoryItem
{
    public int Id { get; set; }
    
    public int ProductId { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "InStock"; 
    public DateTime ImportDate { get; set; } = DateTime.UtcNow;
    
    public int? OrderDetailId { get; set; }

    public Product? Product { get; set; }
    public OrderDetail? OrderDetail { get; set; }
}
