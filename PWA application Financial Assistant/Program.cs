using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PWA_application_Financial_Assistant;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.AddConsole();


builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Добавление политики CORS
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowFrontend", builder =>
//        builder.WithOrigins("http://localhost:7034") // Разрешаем фронтенд с этого адреса
//               .AllowAnyMethod()
//               .AllowAnyHeader()
//               .AllowCredentials());
//});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = AuthOptions.ISSUER,
            ValidateAudience = true,
            ValidAudience = AuthOptions.AUDIENCE,
            ValidateLifetime = true,
            IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(),
            ValidateIssuerSigningKey = true,
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Применяем CORS в пайплайне
app.UseCors("AllowFrontend"); // Применяем CORS политику для фронтенда

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// Применяем аутентификацию и авторизацию после CORS
app.UseAuthentication();
app.UseAuthorization();



// Роут для регистрации
app.MapPost("/register", async (Person registerData, ApplicationContext db) =>
{
    Console.WriteLine($"Пришла регистрация: {registerData.email}");

    if (string.IsNullOrWhiteSpace(registerData.email) || string.IsNullOrWhiteSpace(registerData.password))
    {
        Console.WriteLine("Ошибка: пустые email или пароль.");
        return Results.BadRequest(new { message = "Email и пароль не могут быть пустыми." });
    }

    var existingUser = await db.People.FirstOrDefaultAsync(p => p.email == registerData.email);
    if (existingUser != null)
    {
        Console.WriteLine("Ошибка: пользователь уже существует.");
        return Results.BadRequest(new { message = "Пользователь с таким email уже существует." });
    }

    var hashedPassword = HashPassword(registerData.password);

    var newPerson = new Person
    {
        email = registerData.email,
        password = hashedPassword,
    };

    db.People.Add(newPerson);
    await db.SaveChangesAsync();

    Console.WriteLine("Регистрация успешна!");
    return Results.Ok(new { message = "Регистрация успешна." });
});


// Роут для логина
app.MapPost("/login", async (Person loginData, ApplicationContext db) =>
{
    if (string.IsNullOrWhiteSpace(loginData.email) || string.IsNullOrWhiteSpace(loginData.password))
    {
        return Results.BadRequest(new { message = "Email и пароль не могут быть пустыми." });
    }

    var person = await db.People.FirstOrDefaultAsync(p => p.email == loginData.email);
    if (person == null)
    {
        return Results.Unauthorized(); // Пользователь с таким email не найден
    }

    // Сравниваем захешированный пароль
    var hashedPassword = HashPassword(loginData.password);
    if (person.password != hashedPassword)
    {
        return Results.Unauthorized(); // Пароль не совпадает
    }

    // Создаем токен
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, person.personId.ToString()), // Уникальный userId
        new Claim(ClaimTypes.Name, person.email), // Email или другие уникальные данные
        new Claim(ClaimTypes.Role, person.Role ?? "User")

    };

    var jwt = GenerateJwtToken(claims); // Генерация уникального токена

    // Отправляем токен в ответе
    return Results.Json(new
    {
        access_token = jwt,
        username = person.email,
        userId = person.personId
    });


});



// метод для генерации jwt токена
static string GenerateJwtToken(List<Claim> claims)
{
    var jwt = new JwtSecurityToken(
        issuer: AuthOptions.ISSUER,
        audience: AuthOptions.AUDIENCE,
        claims: claims, // Claims с уникальной информацией для каждого пользователя
        expires: DateTime.UtcNow.AddMinutes(60), // Токен истечет через 60 минут
        signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256)
    );

    return new JwtSecurityTokenHandler().WriteToken(jwt); // Генерируем токен с уникальными данными
}




app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapGet("/check-session", (HttpContext context, ILogger<Program> logger) =>
{
    var user = context.User;
    logger.LogInformation("Проверка сессии для пользователя: {Username}", user.Identity?.Name);

    if (user.Identity?.IsAuthenticated == true)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = user.FindFirst(ClaimTypes.Name)?.Value;
        var role = user.FindFirst(ClaimTypes.Role)?.Value ?? "User";

        


        logger.LogInformation("Пользователь: {Username} с userId: {UserId}", username, userId);

        return Results.Json(new { userId, username, role });
    }

    logger.LogWarning("Пользователь не авторизован.");
    return Results.Unauthorized();
});

app.Run();


// Метод для хэширования пароля
static string HashPassword(string password)
{
    using (var sha256 = SHA256.Create())
    {
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}



public class AuthOptions
{
    public const string ISSUER = "FinancialServer";
    public const string AUDIENCE = "FinancialClient";
    const string KEY = "mysupersecret_secretsecretsecretkey!123"; // Секретный ключ для подписи токенов
    public static SymmetricSecurityKey GetSymmetricSecurityKey() => new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));
}
