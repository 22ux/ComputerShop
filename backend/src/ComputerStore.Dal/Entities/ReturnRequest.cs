namespace ComputerStore.Dal.Entities;

public class ReturnRequest
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Exchanged
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
