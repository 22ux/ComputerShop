using ComputerStore.Bll.Dtos.Categories;

namespace ComputerStore.Bll.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyCollection<CategoryDto>> GetPublicAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CategoryDto>> GetAdminAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(CategoryRequest request, CancellationToken cancellationToken = default);
    Task<CategoryDto> UpdateAsync(int id, CategoryRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
