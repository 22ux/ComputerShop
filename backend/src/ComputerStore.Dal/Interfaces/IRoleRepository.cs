using ComputerStore.Dal.Entities;

namespace ComputerStore.Dal.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
