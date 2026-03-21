using ComputerStore.Bll.Dtos.Categories;
using ComputerStore.Bll.Exceptions;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Entities;
using ComputerStore.Dal.Interfaces;

namespace ComputerStore.Bll.Services;

public class CategoryService(ICategoryRepository categoryRepository, IUnitOfWork unitOfWork) : ICategoryService
{
    public async Task<IReadOnlyCollection<CategoryDto>> GetPublicAsync(CancellationToken cancellationToken = default)
        => (await categoryRepository.GetAllAsync(cancellationToken: cancellationToken)).Select(MapCategory).ToList();

    public async Task<IReadOnlyCollection<CategoryDto>> GetAdminAsync(CancellationToken cancellationToken = default)
        => (await categoryRepository.GetAllAsync(includeDeleted: true, cancellationToken)).Select(MapCategory).ToList();

    public async Task<CategoryDto> CreateAsync(CategoryRequest request, CancellationToken cancellationToken = default)
    {
        if (await categoryRepository.ExistsByNameAsync(request.Name, cancellationToken: cancellationToken))
        {
            throw new AppException("Ten danh muc da ton tai.");
        }

        var category = new Category
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim()
        };

        await categoryRepository.AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return MapCategory(category);
    }

    public async Task<CategoryDto> UpdateAsync(int id, CategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await categoryRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Khong tim thay danh muc.", 404);

        if (await categoryRepository.ExistsByNameAsync(request.Name, id, cancellationToken))
        {
            throw new AppException("Ten danh muc da ton tai.");
        }

        category.Name = request.Name.Trim();
        category.Description = request.Description.Trim();

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return MapCategory(category);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await categoryRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new AppException("Khong tim thay danh muc.", 404);

        category.IsDeleted = true;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static CategoryDto MapCategory(Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        IsDeleted = category.IsDeleted
    };
}
