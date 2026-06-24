using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;

namespace ComputerStore.Bll.Services;

public class InventoryService(
    IInventoryItemRepository inventoryItemRepository,
    IProductRepository productRepository,
    IUnitOfWork unitOfWork) : IInventoryService
{
    public async Task<IReadOnlyList<InventoryItemDto>> AddStockAsync(int productId, AddStockRequest request, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(productId, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay san pham.", 404);

        if (request.SerialNumbers.Distinct().Count() != request.SerialNumbers.Count)
        {
            throw new AppException("Danh sach Seri gui len co chua cac so bi trung lap.");
        }

        bool exists = await inventoryItemRepository.ExistsBySerialNumbersAsync(request.SerialNumbers, cancellationToken);
        if (exists)
        {
            throw new AppException("Mot hoac nhieu so Seri da ton tai trong he thong.");
        }

        var items = request.SerialNumbers.Select(sn => new InventoryItem
        {
            ProductId = productId,
            SerialNumber = sn,
            Status = "InStock",
            ImportDate = DateTime.UtcNow
        }).ToList();

        await inventoryItemRepository.AddRangeAsync(items, cancellationToken);
        
        product.StockQuantity += items.Count;
        
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return items.Select(i => new InventoryItemDto
        {
            Id = i.Id,
            SerialNumber = i.SerialNumber,
            Status = i.Status,
            ImportDate = i.ImportDate
        }).ToList();
    }

    public async Task<IReadOnlyList<InventoryItemDto>> GetInventoryByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(productId, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay san pham.", 404);

        var items = await inventoryItemRepository.GetByProductIdAsync(productId, cancellationToken);

        return items.Select(i => new InventoryItemDto
        {
            Id = i.Id,
            SerialNumber = i.SerialNumber,
            Status = i.Status,
            ImportDate = i.ImportDate
        }).ToList();
    }

    public async Task<InventoryItemDto> ChangeStatusAsync(string serialNumber, UpdateInventoryStatusRequest request, CancellationToken cancellationToken = default)
    {
        var item = await inventoryItemRepository.GetBySerialNumberAsync(serialNumber, cancellationToken)
            ?? throw new AppException("Khong tim thay so Seri nay.", 404);

        if (item.Product == null)
        {
            throw new AppException("Khong tim thay san pham lien ket voi so Seri nay.", 404);
        }

        string oldStatus = item.Status;
        string newStatus = request.Status;

        if (oldStatus == "InStock" && newStatus != "InStock")
        {
            item.Product.StockQuantity -= 1;
        }
        else if (oldStatus != "InStock" && newStatus == "InStock")
        {
            item.Product.StockQuantity += 1;
        }

        item.Status = newStatus;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new InventoryItemDto
        {
            Id = item.Id,
            SerialNumber = item.SerialNumber,
            Status = item.Status,
            ImportDate = item.ImportDate
        };
    }

    public async Task<WarrantyStatusDto> CheckWarrantyAsync(string serialNumber, CancellationToken cancellationToken = default)
    {
        var item = await inventoryItemRepository.GetBySerialNumberAsync(serialNumber, cancellationToken);
        if (item == null || item.Product == null)
        {
            return new WarrantyStatusDto
            {
                SerialNumber = serialNumber,
                IsValid = false,
                Message = "Không tìm thấy Số Seri này trong hệ thống."
            };
        }

        if (item.OrderDetail == null || item.OrderDetail.Order == null)
        {
            return new WarrantyStatusDto
            {
                SerialNumber = serialNumber,
                ProductName = item.Product.Name,
                IsValid = false,
                Message = "Sản phẩm này chưa được bán ra."
            };
        }

        var purchaseDate = item.OrderDetail.Order.CreatedAt;
        var expirationDate = purchaseDate.AddMonths(item.Product.WarrantyMonths);
        var isValid = DateTime.UtcNow <= expirationDate;

        return new WarrantyStatusDto
        {
            SerialNumber = serialNumber,
            ProductName = item.Product.Name,
            PurchaseDate = purchaseDate,
            ExpirationDate = expirationDate,
            IsValid = isValid,
            Message = isValid ? "Sản phẩm vẫn đang trong thời hạn bảo hành." : "Sản phẩm đã hết hạn bảo hành."
        };
    }
}
