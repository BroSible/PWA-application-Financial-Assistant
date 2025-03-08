using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PWA_application_Financial_Assistant;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthorization();
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

builder.Services.AddControllersWithViews();

// ��������� �������� CORS ��� ���������� �������� � ������������� ���������
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:7034")  // ������� ����� ������ ���������
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// ��������� �������� CORS, �� UseAuthentication()
app.UseCors("AllowSpecificOrigin");  // ��������� �������� CORS

app.UseAuthentication();
app.UseAuthorization();


builder.Logging.AddConsole();


static string HashPassword(string password)
{
    using (var sha256 = SHA256.Create())
    {
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}

// ���� ��� �����������
app.MapPost("/register", async (Person registerData, ApplicationContext db) =>
{
    if (string.IsNullOrWhiteSpace(registerData.email) || string.IsNullOrWhiteSpace(registerData.password))
    {
        return Results.BadRequest(new { message = "Email � ������ �� ����� ���� �������." });
    }

    var existingUser = await db.People.FirstOrDefaultAsync(p => p.email == registerData.email);
    if (existingUser != null)
    {
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

    return Results.Ok(new { message = "����������� �������." });
});

// ���� ��� ������
app.MapPost("/login", async (Person loginData, ApplicationContext db) =>
{
    if (string.IsNullOrWhiteSpace(loginData.email) || string.IsNullOrWhiteSpace(loginData.password))
    {
        return Results.BadRequest(new { message = "Email � ������ �� ����� ���� �������." });
    }

    var hashedPassword = HashPassword(loginData.password);

    var person = await db.People.FirstOrDefaultAsync(p => p.email == loginData.email && p.password == hashedPassword);

    if (person is null)
    {
        return Results.Unauthorized();
    }

    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, person.personId.ToString()), // ��������� userId � �����
        new Claim(ClaimTypes.Name, person.email)
    };

    var jwt = new JwtSecurityToken(
        issuer: AuthOptions.ISSUER,
        audience: AuthOptions.AUDIENCE,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(60),
        signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));

    var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

    return Results.Json(new
    {
        access_token = encodedJwt,
        username = person.email,
        userId = person.personId // ��������� userId � �����
    });
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder.WithOrigins("http://localhost:5173") // ����� ���� ������ ������
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

app.UseCors("AllowFrontend");  // �������� CORS ������ ��� ���������

public class AuthOptions
{
    public const string ISSUER = "FinancialServer";
    public const string AUDIENCE = "FinancialClient";
    const string KEY = "mysupersecret_secretsecretsecretkey!123";
    public static SymmetricSecurityKey GetSymmetricSecurityKey() => new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY));
}
