using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniversityLibraryService.Data;
using UniversityLibraryService.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers with JSON formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// 2. MySQL Database Connection (Central university_db)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=university_db;User=root;Password=root@123;";

var serverVersion = new MySqlServerVersion(new Version(9, 6, 0));
builder.Services.AddDbContext<LibraryDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));

// 3. Register Library Domain Service
builder.Services.AddScoped<ILibraryService, LibraryService>();

// 4. Configure Cross-Origin Resource Sharing (CORS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// 5. Initialize MySQL database tables & catalog seed holdings
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    LibraryDbInitializer.Initialize(db, logger);
}

app.UseCors("AllowAll");

// 6. Direct root diagnostic endpoint
app.MapGet("/", () => Results.Ok(new
{
    service = "university-library-service",
    framework = "ASP.NET Core Web API (.NET 10.0)",
    status = "healthy",
    port = 5300,
    timestamp = DateTime.UtcNow
}));

app.MapControllers();

app.Run("http://0.0.0.0:5300");
