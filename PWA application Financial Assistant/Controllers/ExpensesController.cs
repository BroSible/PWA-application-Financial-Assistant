using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

            expenses.personId = userId.Value;

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




        // Метод для извлечения userId из токена
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
