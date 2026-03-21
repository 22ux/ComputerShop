using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected int CurrentUserId
    {
        get
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(value, out var userId))
            {
                throw new UnauthorizedAccessException("Token khong hop le.");
            }

            return userId;
        }
    }
}
