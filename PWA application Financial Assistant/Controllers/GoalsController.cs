﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace PWA_application_Financial_Assistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoalsController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly ILogger<GoalsController> _logger;

        public GoalsController(ApplicationContext context, ILogger<GoalsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddGoal([FromBody] Goals goals)
        {
            if (goals == null)
            {
                _logger.LogWarning("Цель не может быть пустой.");
                return BadRequest(new { message = "Цель не может быть пустой" });
            }

            if (string.IsNullOrWhiteSpace(goals.title) ||
                goals.target_date == default ||
                goals.amount <= 0 ||
                goals.income <= 0 ||
                string.IsNullOrWhiteSpace(goals.currency))
            {
                _logger.LogWarning("Некорректные данные: {Data}", goals);
                return BadRequest(new { message = "Все поля должны быть заполнены правильно." });
            }

            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogError("Ошибка авторизации: userId не найден в токене.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            goals.personId = userId.Value;

            if (goals.target_date != default)
            {
                goals.target_date = goals.target_date.ToUniversalTime();
            }

            _logger.LogInformation("Добавление новой цели для userId: {UserId}", userId.Value);

            try
            {
                _context.Goals.Add(goals);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetGoal", new { id = goals.id }, goals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при сохранении цели");
                return StatusCode(500, new { message = "Ошибка при сохранении цели." });
            }
        }

        [HttpPatch("{id}/topup")]
        [Authorize]
        public async Task<IActionResult> TopUpGoal(int id, [FromBody] TopUpRequest request)
        {
            if (request.Amount <= 0)
            {
                _logger.LogWarning("Сумма пополнения должна быть больше 0.");
                return BadRequest(new { message = "Сумма должна быть больше нуля." });
            }

            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogWarning("Ошибка авторизации: userId не найден.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            var goal = await _context.Goals.FirstOrDefaultAsync(g => g.id == id && g.personId == userId.Value);
            if (goal == null)
            {
                _logger.LogWarning("Цель с id {Id} не найдена для userId {UserId}.", id, userId.Value);
                return NotFound(new { message = "Цель не найдена." });
            }

            goal.saved += request.Amount;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Цель с id {Id} пополнена на {Amount} пользователем {UserId}.", id, request.Amount, userId.Value);
                return Ok(goal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при пополнении цели.");
                return StatusCode(500, new { message = "Ошибка при пополнении цели." });
            }
        }

        public class TopUpRequest
        {
            public decimal Amount { get; set; }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetGoal(int id)
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogError("Ошибка авторизации: userId не найден.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            var goal = await _context.Goals
                .Where(g => g.personId == userId.Value && g.id == id)
                .FirstOrDefaultAsync();

            if (goal == null)
            {
                _logger.LogWarning("Цель с id {Id} не найдена для userId {UserId}.", id, userId.Value);
                return NotFound(new { message = "Цель не найдена." });
            }

            return Ok(goal);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogWarning("Ошибка авторизации: userId не найден.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            var goal = await _context.Goals.FirstOrDefaultAsync(g => g.id == id && g.personId == userId.Value);
            if (goal == null)
            {
                _logger.LogWarning("Цель с id {Id} не найдена для userId {UserId}.", id, userId.Value);
                return NotFound(new { message = "Цель не найдена." });
            }

            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Цель с id {Id} удалена пользователем {UserId}.", id, userId.Value);
            return NoContent();
        }

        public async Task<IActionResult> GetGoals()
        {
            var userId = GetUserIdFromToken(HttpContext);

            var goals = await _context.Goals.Where(g => g.personId == userId.Value).ToListAsync();
            return Ok(goals);
        }

        private int? GetUserIdFromToken(HttpContext httpContext)
        {
            var claim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out var userId))
            {
                return userId;
            }

            return null;
        }
    }
}

