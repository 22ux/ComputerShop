using ComputerStore.Dal.Enums;

namespace ComputerStore.Dal.QueryObjects;

public class StatusCountResult
{
    public OrderStatus Status { get; set; }
    public int Count { get; set; }
}
