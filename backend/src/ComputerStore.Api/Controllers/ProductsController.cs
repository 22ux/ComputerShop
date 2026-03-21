using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Bll.Models;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Route("api/products")]
public class ProductsController(IProductService productService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductSummaryDto>>> Get([FromQuery] ProductFilterRequest request, CancellationToken cancellationToken)
        => Ok(await productService.GetPublicProductsAsync(request, cancellationToken));

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyCollection<string>>> GetBrands(CancellationToken cancellationToken)
        => Ok(await productService.GetBrandsAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(int id, CancellationToken cancellationToken)
        => Ok(await productService.GetByIdAsync(id, cancellationToken: cancellationToken));
}
