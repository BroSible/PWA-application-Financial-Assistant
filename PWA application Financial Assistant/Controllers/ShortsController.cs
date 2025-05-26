using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PWA_application_Financial_Assistant;
using Microsoft.EntityFrameworkCore;


[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ShortsController : ControllerBase
{
    private readonly ApplicationContext _context;
    private readonly IWebHostEnvironment _env;

    public ShortsController(ApplicationContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var shorts = await _context.Shorts.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(shorts);
    }



    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadShort([FromForm] IFormFile file, [FromForm] string title)

    {
        if (file == null || file.Length == 0)
            return BadRequest("Файл не выбран");

        var folder = Path.Combine("wwwroot", "shorts");
        Directory.CreateDirectory(folder);

        var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(folder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var shortEntry = new Short
        {
            Title = title,
            FilePath = "/shorts/" + fileName,
            CreatedAt = DateTime.UtcNow 
        };


        _context.Shorts.Add(shortEntry);
        await _context.SaveChangesAsync();

        return Ok(shortEntry);
    }
}
