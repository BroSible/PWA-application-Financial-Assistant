using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace PWA_application_Financial_Assistant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationContext _context;
        private readonly ILogger<ApplicationContext> _logger;
       
        public ExpensesController(ApplicationContext context, ILogger<ApplicationContext> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/expenses
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddExpense([FromBody] Expenses expenses)
        {
            if(expenses == null)
            {
                _logger.LogWarning("Расход не может быть пустой.");
                return BadRequest(new { message = "Расход не может быть пустой" });
            }

            if(string.IsNullOrEmpty(expenses.title) || 
               expenses.date == default ||
               expenses.amount <= 0)
            {
                _logger.LogWarning("Некорректные данные: {Data}",expenses);
                return BadRequest(new { message = "Все поля должны быть заполнены правильно." });
            }

            var userId = GetUserIdFromToken(HttpContext);

            if (userId == null) 
            {
                _logger.LogWarning("Ошибка авторизации: userId не найден");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            expenses.personid = userId.Value;

            // Конвертация Date в UTC
            if (expenses.date != default)
            {
                expenses.date = expenses.date.ToUniversalTime();
            }

            _logger.LogInformation("Добавление нововых расходов для userId: {UserId}", userId.Value);

            try
            {
                _context.Expenses.Add(expenses);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetExpense", new { id = expenses.id }, expenses);
            }

            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при сохранении расходов");
                return StatusCode(500, new { message = "Ошибка при сохранении расходов." });
            }
        }

        // GET: api/expenses/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetExpense(int id)
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogError("Ошибка авторизации: userId не найден.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            var expense = await _context.Expenses
                .Where(g => g.personid == userId.Value && g.id == id)
                .FirstOrDefaultAsync();

            if (expense == null)
            {
                _logger.LogWarning("Цель с id {Id} не найдена для userId {UserId}.", id, userId.Value);
                return NotFound(new { message = "Цель не найдена." });
            }

            return Ok(expense);
        }

        // GET: api/expenses
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetExpenses()
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogError("Ошибка авторизации: userId не найден.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            var expenses = await _context.Expenses.Where(e => e.personid == userId.Value).ToListAsync();

            return Ok(expenses);
        }

        // DELETE: api/expenses/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var userId = GetUserIdFromToken(HttpContext);
            if (userId == null)
            {
                _logger.LogWarning("Ошибка авторизации: userId не найден.");
                return Unauthorized(new { message = "Не удалось получить идентификатор пользователя." });
            }

            var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.id == id && e.personid == userId.Value);
            if (expense == null)
            {
                _logger.LogWarning("Расход с id {Id} не найден для userId {UserId}.", id, userId.Value);
                return NotFound(new { message = "Расход не найден." });
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Расход с id {Id} удалён пользователем {UserId}.", id, userId.Value);
            return NoContent();
        }



        // метод для извлечения userId из токена
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

