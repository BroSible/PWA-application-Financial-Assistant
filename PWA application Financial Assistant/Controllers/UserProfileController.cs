using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace PWA_application_Financial_Assistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly ILogger<UserProfileController> _logger;

        public UserProfileController(ApplicationContext context, ILogger<UserProfileController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Получение текущего профиля
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogWarning("userId не найден в токене.");
                return Unauthorized();
            }

            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.personId == userId);

            if (profile == null)
            {
                var newProfile = new UserProfile
                {
                    personId = userId.Value,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };

                _context.UserProfiles.Add(newProfile);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Создан новый профиль для userId {UserId}", userId.Value);
                return Ok(newProfile);
            }

            return Ok(profile);
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UserProfileUpdateDto updated)
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogWarning("userId не найден в токене при попытке обновления профиля.");
                return Unauthorized();
            }

            try
            {
                var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.personId == userId);
                if (profile == null)
                {
                    _logger.LogWarning("Профиль не найден для userId {UserId}", userId);
                    return NotFound();
                }

                profile.username = updated.username?.Trim();
                profile.bio = updated.bio?.Trim();

                if (updated.birthdate.HasValue)
                {
                    profile.birthdate = updated.birthdate.Value;
                }
                else
                {
                    profile.birthdate = null;
                }


                profile.updated_at = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("Профиль обновлён для userId {UserId}", userId);

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении профиля для userId {UserId}", userId);
                return StatusCode(500, new { message = "Ошибка при обновлении профиля" });
            }
        }

        public class UserProfileUpdateDto
        {
            public string? username { get; set; }
            public string? bio { get; set; }
            public DateTime? birthdate { get; set; }
        }

        [HttpPost("avatar")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogWarning("userId не найден при загрузке аватара.");
                return Unauthorized(new { message = "Пользователь не авторизован." });
            }

            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("Файл не передан или пуст при загрузке аватара.");
                return BadRequest(new { message = "Файл пуст или не передан." });
            }

            var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.personId == userId);
            if (profile == null)
            {
                _logger.LogWarning("Профиль не найден при загрузке аватара для userId {UserId}.", userId);
                return NotFound(new { message = "Профиль не найден." });
            }

            var avatarDir = Path.Combine("wwwroot", "uploads", "avatars");
            Directory.CreateDirectory(avatarDir);

            var fileName = $"user_{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(avatarDir, fileName);

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                profile.avatar_path = $"/uploads/avatars/{fileName}";
                profile.updated_at = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Аватар обновлён для userId {UserId}", userId);
                return Ok(new { avatarUrl = profile.avatar_path });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при сохранении аватара для userId {UserId}", userId);
                return StatusCode(500, new { message = "Ошибка сервера при загрузке изображения." });
            }
        }

        private int? GetUserIdFromToken(HttpContext context)
        {
            var claim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
        }
    }
}
