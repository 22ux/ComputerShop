using ComputerStore.Bll.Dtos.Products;
using ComputerStore.Bll.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComputerStore.Api.Controllers;

[Authorize]
[Route("api/reviews")]
public class ReviewsController(IReviewService reviewService) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewRequest request, CancellationToken cancellationToken)
    {
        var review = await reviewService.CreateAsync(CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = review.Id }, review);
    }
}
