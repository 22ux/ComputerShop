namespace ComputerStore.Bll.Dtos.Dashboard;

public class RevenuePointDto
{
    public DateTime Date { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}
