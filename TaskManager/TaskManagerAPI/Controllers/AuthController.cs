using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.DTOs;
using TaskManagerAPI.Middleware;

namespace TaskManagerAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var passwordHash = BasicAuthMiddleware.HashPassword(dto.Password);
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Username == dto.Username && u.PasswordHash == passwordHash);

        if (user == null)
            return Unauthorized(new { message = "Invalid username or password." });

        // Return Base64 encoded credentials for use in Basic auth header
        var token = Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes($"{dto.Username}:{dto.Password}"));

        return Ok(new { username = user.Username, token });
    }
}
