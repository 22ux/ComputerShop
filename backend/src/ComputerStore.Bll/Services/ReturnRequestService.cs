using ComputerStore.Bll.Dtos;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Enums;
using ComputerStore.Dal.Interfaces;
using ComputerStore.Dal.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Bll.Services;

public class ReturnRequestService(
    ComputerStoreDbContext dbContext,
    IUnitOfWork unitOfWork) : IReturnRequestService
{
    public async Task<ReturnRequestDto> CreateRequestAsync(int userId, CreateReturnRequestDto requestDto, CancellationToken cancellationToken = default)
    {
        var order = await dbContext.Orders
            .Include(o => o.OrderDetails)
            .FirstOrDefaultAsync(o => o.Id == requestDto.OrderId && o.UserId == userId, cancellationToken);

        if (order == null)
        {
            throw new AppException("Không tìm thấy đơn hàng.");
        }

        if (order.Status != OrderStatus.Completed)
        {
            throw new AppException("Chỉ có thể yêu cầu bảo hành cho các đơn hàng đã hoàn tất (Completed).");
        }

        var orderDetail = order.OrderDetails.FirstOrDefault(od => od.ProductId == requestDto.ProductId);
        if (orderDetail == null)
        {
            throw new AppException("Không tìm thấy sản phẩm này trong đơn hàng của bạn.");
        }

        // Check if there's already a pending request for this product in this order
        var existingRequest = await dbContext.ReturnRequests
            .FirstOrDefaultAsync(r => r.OrderId == requestDto.OrderId && r.ProductId == requestDto.ProductId && r.Status != "Rejected", cancellationToken);
        
        if (existingRequest != null)
        {
            throw new AppException("Bạn đã gửi yêu cầu bảo hành cho sản phẩm này rồi.");
        }

        var returnRequest = new ReturnRequest
        {
            UserId = userId,
            OrderId = requestDto.OrderId,
            ProductId = requestDto.ProductId,
            Reason = requestDto.Reason.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.ReturnRequests.Add(returnRequest);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await MapToDtoAsync(returnRequest, cancellationToken);
    }

    public async Task<IEnumerable<ReturnRequestDto>> GetMyRequestsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var requests = await dbContext.ReturnRequests
            .Include(r => r.Product)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return requests.Select(r => new ReturnRequestDto
        {
            Id = r.Id,
            UserId = r.UserId,
            OrderId = r.OrderId,
            ProductId = r.ProductId,
            ProductName = r.Product?.Name ?? string.Empty,
            ProductImageUrl = r.Product?.ImageUrl ?? string.Empty,
            Reason = r.Reason,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<IEnumerable<ReturnRequestDto>> GetAllRequestsAsync(CancellationToken cancellationToken = default)
    {
        var requests = await dbContext.ReturnRequests
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return requests.Select(r => new ReturnRequestDto
        {
            Id = r.Id,
            UserId = r.UserId,
            OrderId = r.OrderId,
            ProductId = r.ProductId,
            ProductName = r.Product?.Name ?? string.Empty,
            ProductImageUrl = r.Product?.ImageUrl ?? string.Empty,
            Reason = r.Reason,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        });
    }

    public async Task<ReturnRequestDto> UpdateStatusAsync(int id, string status, CancellationToken cancellationToken = default)
    {
        var validStatuses = new[] { "Pending", "Approved", "Rejected", "Exchanged" };
        if (!validStatuses.Contains(status))
        {
            throw new AppException("Trạng thái không hợp lệ.");
        }

        var request = await dbContext.ReturnRequests.FindAsync([id], cancellationToken);
        if (request == null)
        {
            throw new AppException("Không tìm thấy yêu cầu.");
        }

        request.Status = status;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await MapToDtoAsync(request, cancellationToken);
    }

    public Task<ReturnRequestDto> ProcessExchangeAsync(int id, ProcessExchangeDto requestDto, CancellationToken cancellationToken = default)
    {
        return unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var returnRequest = await dbContext.ReturnRequests
                .Include(r => r.Order)
                .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (returnRequest == null)
            {
                throw new AppException("Không tìm thấy yêu cầu đổi trả.");
            }

            if (returnRequest.Status != "Approved")
            {
                throw new AppException("Yêu cầu bảo hành phải được 'Approved' trước khi xử lý đổi máy.");
            }

            // Find old inventory item
            var oldItem = await dbContext.InventoryItems
                .FirstOrDefaultAsync(i => i.SerialNumber == requestDto.OldSerialNumber && i.ProductId == returnRequest.ProductId, cancellationToken);

            if (oldItem == null)
            {
                throw new AppException($"Không tìm thấy số Seri cũ: {requestDto.OldSerialNumber} cho sản phẩm này.");
            }

            // Verify the old item actually belonged to this order
            var orderDetail = await dbContext.OrderDetails
                .Include(od => od.InventoryItems)
                .FirstOrDefaultAsync(od => od.OrderId == returnRequest.OrderId && od.ProductId == returnRequest.ProductId, cancellationToken);

            if (orderDetail == null || !orderDetail.InventoryItems.Any(i => i.Id == oldItem.Id))
            {
                throw new AppException($"Số Seri cũ {requestDto.OldSerialNumber} không thuộc hóa đơn này.");
            }

            // Find new inventory item
            var newItem = await dbContext.InventoryItems
                .FirstOrDefaultAsync(i => i.SerialNumber == requestDto.NewSerialNumber && i.ProductId == returnRequest.ProductId && i.Status == "InStock", cancellationToken);

            if (newItem == null)
            {
                throw new AppException($"Không tìm thấy số Seri mới {requestDto.NewSerialNumber} trong kho, hoặc máy đã được bán.");
            }

            // Exchange Logic
            oldItem.Status = "Defective";
            oldItem.OrderDetailId = null;

            newItem.Status = "Sold";
            newItem.OrderDetailId = orderDetail.Id;

            returnRequest.Status = "Exchanged";

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return await MapToDtoAsync(returnRequest, cancellationToken);
        }, cancellationToken);
    }

    private async Task<ReturnRequestDto> MapToDtoAsync(ReturnRequest request, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.FindAsync([request.ProductId], cancellationToken);
        
        return new ReturnRequestDto
        {
            Id = request.Id,
            UserId = request.UserId,
            OrderId = request.OrderId,
            ProductId = request.ProductId,
            ProductName = product?.Name ?? string.Empty,
            ProductImageUrl = product?.ImageUrl ?? string.Empty,
            Reason = request.Reason,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        };
    }
}
