namespace ComputerStore.Bll.Dtos.Dashboard;

public class TopProductDto
{
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
}
