namespace ComputerStore.Bll.Dtos.Users;

public class CustomerSummaryDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int OrderCount { get; set; }
    public decimal TotalSpent { get; set; }
}
