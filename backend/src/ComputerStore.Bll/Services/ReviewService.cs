using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Data;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ComputerStore.Bll.Services;

public class ReviewService(
    ComputerStoreDbContext context,
    IUnitOfWork unitOfWork) : IReviewService
{
    public async Task<ReviewDto> CreateAsync(int userId, CreateReviewRequest request, CancellationToken cancellationToken = default)
    {
        // Verify product exists and is not deleted
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && !p.IsDeleted, cancellationToken)
            ?? throw new AppException("Sản phẩm không tồn tại.", 404);

        // Prevent duplicate reviews from the same user for the same product
        var alreadyReviewed = await context.Reviews
            .AnyAsync(r => r.ProductId == request.ProductId && r.UserId == userId, cancellationToken);

        if (alreadyReviewed)
        {
            throw new AppException("Bạn đã đánh giá sản phẩm này rồi.");
        }

        // Fetch user for display name
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new AppException("Người dùng không tồn tại.", 404);

        var review = new Review
        {
            ProductId = request.ProductId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        context.Reviews.Add(review);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            UserFullName = user.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
