using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Repositories;

public class RoleRepository(ComputerStoreDbContext context) : IRoleRepository
{
    public Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        => context.Roles.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);
}
