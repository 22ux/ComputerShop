using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Bll.Models;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;
using ComputerStore.Dal.QueryObjects;

namespace ComputerStore.Bll.Services;

public class ProductService(
    IProductRepository productRepository,
    ICategoryRepository categoryRepository,
    IUnitOfWork unitOfWork) : IProductService
{
    public Task<PagedResult<ProductSummaryDto>> GetPublicProductsAsync(ProductFilterRequest request, CancellationToken cancellationToken = default)
        => GetPagedAsync(request, includeDeleted: false, cancellationToken);

    public Task<PagedResult<ProductSummaryDto>> GetAdminProductsAsync(ProductFilterRequest request, CancellationToken cancellationToken = default)
        => GetPagedAsync(request, includeDeleted: true, cancellationToken);

    public async Task<ProductDetailDto> GetByIdAsync(int id, bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay san pham.", 404);

        if (!includeDeleted && (product.IsDeleted || product.Category?.IsDeleted == true))
        {
            throw new AppException("Khong tim thay san pham.", 404);
        }

        var detailDto = MapDetail(product);

        if (!string.IsNullOrEmpty(product.ProductGroupId))
        {
            var variants = await productRepository.GetVariantsByGroupIdAsync(product.ProductGroupId, cancellationToken);
            detailDto.Variants = variants.Select(v => new ProductVariantDto
            {
                Id = v.Id,
                VariantName = v.VariantName ?? string.Empty,
                Price = v.Price,
                OldPrice = v.OldPrice,
                ImageUrl = v.ImageUrl
            }).ToList();
        }

        return detailDto;
    }

    public async Task<IReadOnlyCollection<string>> GetBrandsAsync(CancellationToken cancellationToken = default)
        => await productRepository.GetBrandsAsync(cancellationToken);

    public async Task<ProductDetailDto> CreateAsync(ProductUpsertRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateProductAsync(request, null, cancellationToken);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Specification = request.Specification.Trim(),
            Price = request.Price,
            OldPrice = request.OldPrice,
            WarrantyMonths = request.WarrantyMonths,
            StockQuantity = request.StockQuantity,
            ImageUrl = request.ImageUrl.Trim(),
            Brand = request.Brand.Trim(),
            ProductGroupId = string.IsNullOrWhiteSpace(request.ProductGroupId) ? null : request.ProductGroupId.Trim(),
            VariantName = string.IsNullOrWhiteSpace(request.VariantName) ? null : request.VariantName.Trim(),
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow
        };

        await productRepository.AddAsync(product, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(product.Id, includeDeleted: true, cancellationToken);
    }

    public async Task<ProductDetailDto> UpdateAsync(int id, ProductUpsertRequest request, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay san pham.", 404);

        await ValidateProductAsync(request, id, cancellationToken);

        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Specification = request.Specification.Trim();
        product.Price = request.Price;
        product.OldPrice = request.OldPrice;
        product.WarrantyMonths = request.WarrantyMonths;
        product.StockQuantity = request.StockQuantity;
        product.ImageUrl = request.ImageUrl.Trim();
        product.Brand = request.Brand.Trim();
        product.ProductGroupId = string.IsNullOrWhiteSpace(request.ProductGroupId) ? null : request.ProductGroupId.Trim();
        product.VariantName = string.IsNullOrWhiteSpace(request.VariantName) ? null : request.VariantName.Trim();
        product.CategoryId = request.CategoryId;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(product.Id, includeDeleted: true, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await productRepository.GetByIdAsync(id, cancellationToken: cancellationToken)
            ?? throw new AppException("Khong tim thay san pham.", 404);

        product.IsDeleted = true;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<PagedResult<ProductSummaryDto>> GetPagedAsync(ProductFilterRequest request, bool includeDeleted, CancellationToken cancellationToken)
    {
        var query = new ProductQueryOptions
        {
            SearchTerm = request.SearchTerm,
            CategoryId = request.CategoryId,
            Brand = request.Brand,
            MinPrice = request.MinPrice,
            MaxPrice = request.MaxPrice,
            InStock = request.InStock,
            SortBy = request.SortBy,
            Page = request.Page,
            PageSize = request.PageSize,
            IncludeDeleted = includeDeleted
        };

        var (items, totalCount) = await productRepository.GetPagedAsync(query, cancellationToken);

        return new PagedResult<ProductSummaryDto>
        {
            Items = items.Select(MapSummary).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    private async Task ValidateProductAsync(ProductUpsertRequest request, int? productId, CancellationToken cancellationToken)
    {
        if (await productRepository.ExistsByNameAsync(request.Name, productId, cancellationToken))
        {
            throw new AppException("Ten san pham da ton tai.");
        }

        var category = await categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken)
            ?? throw new AppException("Danh muc khong ton tai.", 404);

        if (category.IsDeleted)
        {
            throw new AppException("Danh muc da bi xoa mem.");
        }
    }

    private static ProductSummaryDto MapSummary(Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        OldPrice = product.OldPrice,
        WarrantyMonths = product.WarrantyMonths,
        StockQuantity = product.StockQuantity,
        ImageUrl = product.ImageUrl,
        Brand = product.Brand,
        ProductGroupId = product.ProductGroupId,
        VariantName = product.VariantName,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name ?? string.Empty,
        IsDeleted = product.IsDeleted,
        CreatedAt = product.CreatedAt
    };

    private static ProductDetailDto MapDetail(Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Specification = product.Specification,
        Price = product.Price,
        OldPrice = product.OldPrice,
        WarrantyMonths = product.WarrantyMonths,
        StockQuantity = product.StockQuantity,
        ImageUrl = product.ImageUrl,
        Brand = product.Brand,
        ProductGroupId = product.ProductGroupId,
        VariantName = product.VariantName,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name ?? string.Empty,
        IsDeleted = product.IsDeleted,
        CreatedAt = product.CreatedAt,
        AverageRating = product.Reviews.Count > 0
            ? (float)product.Reviews.Average(r => r.Rating)
            : 0f,
        Images = product.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder
            }).ToList(),
        Attributes = product.Attributes
            .Select(a => new ProductAttributeDto
            {
                Id = a.Id,
                AttributeName = a.AttributeName,
                AttributeValue = a.AttributeValue
            }).ToList(),
        Reviews = product.Reviews
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserFullName = r.User?.FullName ?? "Anonymous",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList()
    };
}
