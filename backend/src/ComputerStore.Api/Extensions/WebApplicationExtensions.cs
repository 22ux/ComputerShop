using ComputerStore.Dal.Data;
using ComputerStore.Dal.Seed;

namespace ComputerStore.Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInitializer");
        var dbContext = scope.ServiceProvider.GetRequiredService<ComputerStoreDbContext>();

        const int maxAttempts = 10;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await dbContext.Database.EnsureCreatedAsync();
                await DbSeeder.SeedAsync(dbContext);
                logger.LogInformation("Database initialized successfully.");
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning(ex, "Database initialization failed on attempt {Attempt}. Retrying...", attempt);
                await Task.Delay(TimeSpan.FromSeconds(5));
            }
        }

        await dbContext.Database.EnsureCreatedAsync();
        await DbSeeder.SeedAsync(dbContext);
    }
}
