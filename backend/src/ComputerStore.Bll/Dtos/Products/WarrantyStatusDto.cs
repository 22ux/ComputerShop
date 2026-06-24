namespace ComputerStore.Bll.Dtos.Products;

public class WarrantyStatusDto
{
    public string SerialNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public DateTime? PurchaseDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
}
