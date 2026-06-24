using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Enums;
using ComputerStore.Dal.Utilities;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Dal.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(ComputerStoreDbContext context)
    {
        if (await context.Roles.AnyAsync())
        {
            return;
        }

        var adminRole = new Role { Name = "Admin" };
        var customerRole = new Role { Name = "Customer" };

        await context.Roles.AddRangeAsync(adminRole, customerRole);
        await context.SaveChangesAsync();

        var adminUser = new User
        {
            FullName = "System Admin",
            Email = "admin@computerstore.local",
            PasswordHash = PasswordHasher.Hash("Admin@123"),
            Phone = "0900000001",
            Address = "Ha Noi",
            RoleId = adminRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-15)
        };

        var customerUser = new User
        {
            FullName = "Nguyen Van A",
            Email = "customer@computerstore.local",
            PasswordHash = PasswordHasher.Hash("Customer@123"),
            Phone = "0900000002",
            Address = "Ho Chi Minh City",
            RoleId = customerRole.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        await context.Users.AddRangeAsync(adminUser, customerUser);
        await context.SaveChangesAsync();

        var categories = new List<Category>
        {
            new() { Name = "Laptop Gaming", Description = "Laptop hieu nang cao cho gaming va streaming." },
            new() { Name = "Laptop Van Phong", Description = "Laptop gon nhe cho hoc tap va cong viec." },
            new() { Name = "PC Gaming", Description = "Bo PC lap rap va dong bo cho game thu." },
            new() { Name = "Man Hinh", Description = "Man hinh gaming, do hoa va van phong." },
            new() { Name = "Ban Phim", Description = "Ban phim co va ban phim van phong." }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        var products = new List<Product>
        {
            new()
            {
                Name = "ASUS ROG Strix G16",
                Description = "Laptop gaming man hinh 16 inch, tan so quet 165Hz, phu hop esport.",
                Specification = "Intel Core i7-13650HX, RTX 4060, RAM 16GB, SSD 1TB, 16 inch FHD 165Hz",
                Price = 38990000m,
                OldPrice = 42990000m,
                WarrantyMonths = 24,
                StockQuantity = 8,
                ImageUrl = "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
                Brand = "ASUS",
                CategoryId = categories[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            },
            new()
            {
                Name = "Lenovo ThinkBook 14",
                Description = "May tinh xach tay van phong ben bi, pin tot, thiet ke gon.",
                Specification = "Intel Core i5-13420H, Intel Graphics, RAM 16GB, SSD 512GB, 14 inch FHD",
                Price = 18990000m,
                OldPrice = 20990000m,
                WarrantyMonths = 12,
                StockQuantity = 12,
                ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
                Brand = "Lenovo",
                CategoryId = categories[1].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new()
            {
                Name = "Apex Hunter RTX 4070",
                Description = "Bo PC gaming cao cap cho AAA game va livestream.",
                Specification = "Ryzen 7 7700, RTX 4070 Super, RAM 32GB, SSD 1TB, PSU 750W",
                Price = 42990000m,
                OldPrice = 45000000m,
                WarrantyMonths = 36,
                StockQuantity = 5,
                ImageUrl = "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80",
                Brand = "Custom Build",
                CategoryId = categories[2].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            },
            new()
            {
                Name = "LG UltraGear 27GS75Q",
                Description = "Man hinh 27 inch QHD, 180Hz, mau sac tot cho game va thiet ke.",
                Specification = "27 inch, QHD, IPS, 180Hz, 1ms, HDR10",
                Price = 7990000m,
                OldPrice = 8590000m,
                WarrantyMonths = 24,
                StockQuantity = 15,
                ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
                Brand = "LG",
                CategoryId = categories[3].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new()
            {
                Name = "Keychron K8 Pro",
                Description = "Ban phim co hot-swap ket noi da che do, layout TKL.",
                Specification = "Bluetooth 5.1, USB-C, hot-swap, RGB, switch tactile",
                Price = 2590000m,
                OldPrice = 2890000m,
                WarrantyMonths = 12,
                StockQuantity = 20,
                ImageUrl = "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
                Brand = "Keychron",
                CategoryId = categories[4].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new()
            {
                Name = "Dell G15 5530",
                Description = "Laptop gaming tam trung, tan nhiet on, de nang cap.",
                Specification = "Intel Core i5-13450HX, RTX 4050, RAM 16GB, SSD 512GB, 15.6 inch 120Hz",
                Price = 27990000m,
                OldPrice = null,
                WarrantyMonths = 12,
                StockQuantity = 9,
                ImageUrl = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80",
                Brand = "Dell",
                CategoryId = categories[0].Id,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        var inventoryItems = new List<InventoryItem>();
        foreach (var product in products)
        {
            for (int i = 0; i < product.StockQuantity; i++)
            {
                inventoryItems.Add(new InventoryItem
                {
                    ProductId = product.Id,
                    SerialNumber = $"SN-{product.Id:D4}-{i + 1:D4}",
                    Status = "InStock",
                    ImportDate = product.CreatedAt.AddHours(1)
                });
            }
        }
        await context.InventoryItems.AddRangeAsync(inventoryItems);
        await context.SaveChangesAsync();

        var seededOrder = new Order
        {
            UserId = customerUser.Id,
            ReceiverName = customerUser.FullName,
            ReceiverPhone = customerUser.Phone,
            ShippingAddress = customerUser.Address,
            Note = "Giao gio hanh chinh",
            Status = OrderStatus.Completed,
            PaymentMethod = PaymentMethod.Cod,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var orderDetails = new List<OrderDetail>
        {
            new()
            {
                Order = seededOrder,
                ProductId = products[3].Id,
                Quantity = 1,
                UnitPrice = products[3].Price,
                SubTotal = products[3].Price
            },
            new()
            {
                Order = seededOrder,
                ProductId = products[4].Id,
                Quantity = 1,
                UnitPrice = products[4].Price,
                SubTotal = products[4].Price
            }
        };

        seededOrder.TotalAmount = orderDetails.Sum(x => x.SubTotal);

        await context.Orders.AddAsync(seededOrder);
        await context.OrderDetails.AddRangeAsync(orderDetails);
        await context.Carts.AddAsync(new Cart
        {
            UserId = customerUser.Id,
            ProductId = products[1].Id,
            Quantity = 1,
            CreatedAt = DateTime.UtcNow.AddHours(-12)
        });

        await context.SaveChangesAsync();
    }
}
