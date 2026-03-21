namespace ComputerStore.Dal.QueryObjects;

public class TopProductResult
{
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}
