using ComputerStore.Bll.Dtos;
using ComputerStore.Bll.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ComputerStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReturnRequestsController(IReturnRequestService returnRequestService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] CreateReturnRequestDto request)
    {
        var result = await returnRequestService.CreateRequestAsync(UserId, request);
        return Ok(result);
    }

    [HttpGet("my-returns")]
    public async Task<IActionResult> GetMyRequests()
    {
        var result = await returnRequestService.GetMyRequestsAsync(UserId);
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllRequests()
    {
        var result = await returnRequestService.GetAllRequestsAsync();
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var result = await returnRequestService.UpdateStatusAsync(id, status);
        return Ok(result);
    }

    [HttpPost("{id}/process-exchange")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ProcessExchange(int id, [FromBody] ProcessExchangeDto request)
    {
        var result = await returnRequestService.ProcessExchangeAsync(id, request);
        return Ok(result);
    }
}
