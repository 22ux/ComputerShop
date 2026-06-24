using ComputerStore.Bll.Dtos.Products;

namespace ComputerStore.Bll.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(int userId, CreateReviewRequest request, CancellationToken cancellationToken = default);
}
