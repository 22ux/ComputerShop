namespace ComputerStore.Dal.Interfaces;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default);
    Task<TResult> ExecuteInTransactionAsync<TResult>(Func<Task<TResult>> action, CancellationToken cancellationToken = default);
}
