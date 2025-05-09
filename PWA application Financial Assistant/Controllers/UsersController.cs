using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PWA_application_Financial_Assistant;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ApplicationContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(ApplicationContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserIdFromToken(HttpContext);
        if (userId == null)
            return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });

        var user = await _context.Users
            .Where(u => u.id == userId.Value)
            .Select(u => new
            {
                u.id,
                u.email,
                u.username,
                u.createdAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "Пользователь не найден." });

        return Ok(user);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserDto dto)
    {
        var userId = GetUserIdFromToken(HttpContext);
        if (userId == null)
            return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.id == userId.Value);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден." });

        user.email = dto.Email ?? user.email;
        user.username = dto.Username ?? user.username;
        // здесь можно добавить обновление пароля, если нужно

        await _context.SaveChangesAsync();
        return Ok(new { message = "Профиль обновлён." });
    }

    private int? GetUserIdFromToken(HttpContext httpContext)
    {
        var claim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var userId) ? userId : null;
    }

    [HttpPost("me/avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var userId = GetUserIdFromToken(HttpContext);
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Файл пуст." });

        var uploadsFolder = Path.Combine("wwwroot", "uploads", "avatars");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"user_{user.id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.avatarPath = $"/uploads/avatars/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { avatarUrl = user.avatarPath });
    }

}

public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? Username { get; set; }
}

