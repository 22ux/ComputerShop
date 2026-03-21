using ComputerStore.Bll.Dtos.Categories;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Route("api/categories")]
public class CategoriesController(ICategoryService categoryService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CategoryDto>>> Get(CancellationToken cancellationToken)
        => Ok(await categoryService.GetPublicAsync(cancellationToken));
}
