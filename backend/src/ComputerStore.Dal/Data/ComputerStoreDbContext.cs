using ComputerStore.Dal.Entities;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Data;

public class ComputerStoreDbContext(DbContextOptions<ComputerStoreDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
    public DbSet<Cart> Carts => Set<Cart>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(50);
            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(x => x.FullName).HasMaxLength(100);
            entity.Property(x => x.Email).HasMaxLength(100);
            entity.Property(x => x.PasswordHash).HasMaxLength(255);
            entity.Property(x => x.Phone).HasMaxLength(20);
            entity.Property(x => x.Address).HasMaxLength(255);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasOne(x => x.Role)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(100);
            entity.Property(x => x.Description).HasMaxLength(255);
            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(200);
            entity.Property(x => x.Brand).HasMaxLength(100);
            entity.Property(x => x.ImageUrl).HasMaxLength(255);
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(x => x.ReceiverName).HasMaxLength(100);
            entity.Property(x => x.ReceiverPhone).HasMaxLength(20);
            entity.Property(x => x.ShippingAddress).HasMaxLength(255);
            entity.Property(x => x.Note).HasMaxLength(255);
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(50);
            entity.HasOne(x => x.User)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.SubTotal).HasPrecision(18, 2);
            entity.HasOne(x => x.Order)
                .WithMany(x => x.OrderDetails)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Product)
                .WithMany(x => x.OrderDetails)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            entity.HasOne(x => x.User)
                .WithMany(x => x.CartItems)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Product)
                .WithMany(x => x.CartItems)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
