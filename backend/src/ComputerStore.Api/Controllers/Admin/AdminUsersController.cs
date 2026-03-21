using ComputerStore.Bll.Dtos.Users;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(IUserService userService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CustomerSummaryDto>>> Get(CancellationToken cancellationToken)
        => Ok(await userService.GetCustomersAsync(cancellationToken));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDetailDto>> GetById(int id, CancellationToken cancellationToken)
        => Ok(await userService.GetByIdAsync(id, cancellationToken));

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<UserDetailDto>> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request, CancellationToken cancellationToken)
        => Ok(await userService.UpdateStatusAsync(id, request, cancellationToken));
}
