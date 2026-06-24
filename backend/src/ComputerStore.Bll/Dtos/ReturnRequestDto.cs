namespace ComputerStore.Bll.Dtos;

public class ReturnRequestDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}

public class CreateReturnRequestDto
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ProcessExchangeDto
{
    public string OldSerialNumber { get; set; } = string.Empty;
    public string NewSerialNumber { get; set; } = string.Empty;
}
