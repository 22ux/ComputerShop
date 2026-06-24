namespace ComputerStore.Bll.Dtos.Products;

public class InventoryItemDto
{
    public int Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ImportDate { get; set; }
}
