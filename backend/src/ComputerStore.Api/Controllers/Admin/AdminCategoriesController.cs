using ComputerStore.Bll.Dtos.Categories;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/categories")]
public class AdminCategoriesController(ICategoryService categoryService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CategoryDto>>> Get(CancellationToken cancellationToken)
        => Ok(await categoryService.GetAdminAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CategoryRequest request, CancellationToken cancellationToken)
        => Ok(await categoryService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryDto>> Update(int id, [FromBody] CategoryRequest request, CancellationToken cancellationToken)
        => Ok(await categoryService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await categoryService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
