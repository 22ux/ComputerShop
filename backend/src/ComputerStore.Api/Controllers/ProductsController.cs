using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Bll.Models;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Route("api/products")]
public class ProductsController(
    IProductService productService,
    IInventoryService inventoryService) : BaseApiController
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

    [HttpGet("check-warranty/{serialNumber}")]
    public async Task<ActionResult<WarrantyStatusDto>> CheckWarranty(string serialNumber, CancellationToken cancellationToken)
        => Ok(await inventoryService.CheckWarrantyAsync(serialNumber, cancellationToken));
}
