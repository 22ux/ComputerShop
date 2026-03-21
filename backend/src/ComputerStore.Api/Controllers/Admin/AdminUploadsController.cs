using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers.Admin;

[Authorize(Roles = "Admin")]
[Route("api/admin/uploads")]
public class AdminUploadsController : BaseApiController
{
    [RequestSizeLimit(10_000_000)]
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "File khong hop le." });
        }

        var uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsDirectory);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsDirectory, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream, cancellationToken);

        var url = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        return Ok(new { url });
    }
}
