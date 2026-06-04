using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

namespace TaskManagerAPI.Middleware;

public class BasicAuthMiddleware
{
    private readonly RequestDelegate _next;

    public BasicAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        // Skip auth for login endpoint and OPTIONS preflight
        if (context.Request.Path.StartsWithSegments("/api/auth") ||
            context.Request.Method == "OPTIONS")
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue("Authorization", out var authHeader) ||
            !AuthenticationHeaderValue.TryParse(authHeader, out var parsed) ||
            !string.Equals(parsed.Scheme, "Basic", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = 401;
            context.Response.Headers["WWW-Authenticate"] = "Basic realm=\"TaskManagement\"";
            await context.Response.WriteAsJsonAsync(new { message = "Authentication required." });
            return;
        }

        string credentials;
        try
        {
            credentials = Encoding.UTF8.GetString(Convert.FromBase64String(parsed.Parameter ?? ""));
        }
        catch
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid credentials format." });
            return;
        }

        var separatorIndex = credentials.IndexOf(':');
        if (separatorIndex < 0)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { message = "Invalid credentials format." });
            return;
        }

        var username = credentials[..separatorIndex];
        var password = credentials[(separatorIndex + 1)..];

        var passwordHash = HashPassword(password);
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Username == username && u.PasswordHash == passwordHash);

        if (user == null)
        {
            context.Response.StatusCode = 401;
            context.Response.Headers["WWW-Authenticate"] = "Basic realm=\"TaskManagement\"";
            await context.Response.WriteAsJsonAsync(new { message = "Invalid username or password." });
            return;
        }

        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Name, user.Username)], "Basic");
        context.User = new ClaimsPrincipal(identity);

        await _next(context);
    }

    public static string HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
