using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
    }
}
