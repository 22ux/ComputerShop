using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Bll.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/products")]
public class AdminProductsController(IProductService productService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductSummaryDto>>> Get([FromQuery] ProductFilterRequest request, CancellationToken cancellationToken)
        => Ok(await productService.GetAdminProductsAsync(request, cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(int id, CancellationToken cancellationToken)
        => Ok(await productService.GetByIdAsync(id, includeDeleted: true, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<ProductDetailDto>> Create([FromBody] ProductUpsertRequest request, CancellationToken cancellationToken)
        => Ok(await productService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> Update(int id, [FromBody] ProductUpsertRequest request, CancellationToken cancellationToken)
        => Ok(await productService.UpdateAsync(id, request, cancellationToken));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await productService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
