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

// ���������� �������� CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
        builder.WithOrigins("http://localhost:50451") // ��������� �������� � ����� ������
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials());
});

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

// ��������� CORS � ���������
app.UseCors("AllowFrontend"); // ��������� CORS �������� ��� ���������

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// ��������� �������������� � ����������� ����� CORS
app.UseAuthentication();
app.UseAuthorization();



// ���� ��� �����������
app.MapPost("/register", async (Person registerData, ApplicationContext db) =>
{
    Console.WriteLine($"������ �����������: {registerData.email}");

    if (string.IsNullOrWhiteSpace(registerData.email) || string.IsNullOrWhiteSpace(registerData.password))
    {
        Console.WriteLine("������: ������ email ��� ������.");
        return Results.BadRequest(new { message = "Email � ������ �� ����� ���� �������." });
    }

    var existingUser = await db.People.FirstOrDefaultAsync(p => p.email == registerData.email);
    if (existingUser != null)
    {
        Console.WriteLine("������: ������������ ��� ����������.");
        return Results.BadRequest(new { message = "������������ � ����� email ��� ����������." });
    }

    var hashedPassword = HashPassword(registerData.password);

    var newPerson = new Person
    {
        email = registerData.email,
        password = hashedPassword,
    };

    db.People.Add(newPerson);
    await db.SaveChangesAsync();

    Console.WriteLine("����������� �������!");
    return Results.Ok(new { message = "����������� �������." });
});


// ���� ��� ������
app.MapPost("/login", async (Person loginData, ApplicationContext db) =>
{
    if (string.IsNullOrWhiteSpace(loginData.email) || string.IsNullOrWhiteSpace(loginData.password))
    {
        return Results.BadRequest(new { message = "Email � ������ �� ����� ���� �������." });
    }

    var person = await db.People.FirstOrDefaultAsync(p => p.email == loginData.email);
    if (person == null)
    {
        return Results.Unauthorized(); // ������������ � ����� email �� ������
    }

    // ���������� �������������� ������
    var hashedPassword = HashPassword(loginData.password);
    if (person.password != hashedPassword)
    {
        return Results.Unauthorized(); // ������ �� ���������
    }

    // ������� �����
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, person.personId.ToString()), // ���������� userId
        new Claim(ClaimTypes.Name, person.email) // Email ��� ������ ���������� ������
    };

    var jwt = GenerateJwtToken(claims); // ��������� ����������� ������

    // ���������� ����� � ������
    return Results.Json(new
    {
        access_token = jwt,
        username = person.email,
        userId = person.personId
    });


});



// ����� ��� ��������� jwt ������
static string GenerateJwtToken(List<Claim> claims)
{
    var jwt = new JwtSecurityToken(
        issuer: AuthOptions.ISSUER,
        audience: AuthOptions.AUDIENCE,
        claims: claims, // Claims � ���������� ����������� ��� ������� ������������
        expires: DateTime.UtcNow.AddMinutes(60), // ����� ������� ����� 60 �����
        signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256)
    );

    return new JwtSecurityTokenHandler().WriteToken(jwt); // ���������� ����� � ����������� �������
}




app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapGet("/check-session", (HttpContext context, ILogger<Program> logger) =>
{
    var user = context.User;
    logger.LogInformation("�������� ������ ��� ������������: {Username}", user.Identity?.Name);

    if (user.Identity?.IsAuthenticated == true)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = user.FindFirst(ClaimTypes.Name)?.Value;

        logger.LogInformation("������������: {Username} � userId: {UserId}", username, userId);

        return Results.Json(new { userId, username });
    }

    logger.LogWarning("������������ �� �����������.");
    return Results.Unauthorized();
});

app.Run();


// ����� ��� ����������� ������
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
    const string KEY = "mysupersecret_secretsecretsecretkey!123"; // ��������� ���� ��� ������� �������
    public static SymmetricSecurityKey GetSymmetricSecurityKey() => new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));
}
