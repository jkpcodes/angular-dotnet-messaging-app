using API.Data;
using API.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Wait for the action to execute
        var resultContext = await next();

        // Check if the user is authenticated
        if (!resultContext.HttpContext.User.Identity?.IsAuthenticated ?? false) return;

        var memberId = resultContext.HttpContext.User.GetMemberId();

        // Get db context using service locator pattern
        var dbContext = resultContext.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

        // Update the last active property for the member
        await dbContext.Members
            .Where(x => x.Id == memberId)
            .ExecuteUpdateAsync(x => x.SetProperty(m => m.LastActive, DateTime.UtcNow));
    }
}