using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ComputerStore.Dal.Data;

/// <summary>
/// Allows EF Core tools (dotnet ef) to instantiate the DbContext at design time
/// without requiring the full startup project to be configured.
/// </summary>
public class ComputerStoreDbContextFactory : IDesignTimeDbContextFactory<ComputerStoreDbContext>
{
    public ComputerStoreDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ComputerStoreDbContext>();
        optionsBuilder.UseSqlServer(
            "server=localhost;database=DB1;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;");

        return new ComputerStoreDbContext(optionsBuilder.Options);
    }
}
