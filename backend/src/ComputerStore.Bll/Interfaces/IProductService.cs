using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Models;

namespace ComputerStore.Bll.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductSummaryDto>> GetPublicProductsAsync(ProductFilterRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<ProductSummaryDto>> GetAdminProductsAsync(ProductFilterRequest request, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> GetByIdAsync(int id, bool includeDeleted = false, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<string>> GetBrandsAsync(CancellationToken cancellationToken = default);
    Task<ProductDetailDto> CreateAsync(ProductUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> UpdateAsync(int id, ProductUpsertRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
