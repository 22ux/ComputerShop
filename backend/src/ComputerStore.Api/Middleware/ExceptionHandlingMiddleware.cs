using System.Net;
using System.Text.Json;
using ComputerStore.Bll.Exceptions;

namespace ComputerStore.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            logger.LogWarning(ex, "Application error");
            await WriteErrorAsync(context, ex.StatusCode, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Unauthorized request");
            await WriteErrorAsync(context, (int)HttpStatusCode.Unauthorized, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled error");
            await WriteErrorAsync(context, (int)HttpStatusCode.InternalServerError, "Da xay ra loi khong mong muon.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = JsonSerializer.Serialize(new
        {
            message,
            statusCode
        });

        await context.Response.WriteAsync(payload);
    }
}
