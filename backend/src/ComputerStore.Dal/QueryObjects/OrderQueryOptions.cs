namespace ComputerStore.Dal.QueryObjects;

public class OrderQueryOptions
{
    public string? SearchTerm { get; set; }
    public string? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
