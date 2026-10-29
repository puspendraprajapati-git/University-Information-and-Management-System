using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UniversityFeeService.Data;
using UniversityFeeService.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers & HTTP Client
builder.Services.AddControllers();
builder.Services.AddHttpClient();

// 2. Database Connection (shared university_db)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3306;Database=university_db;User=root;Password=root@123;";

var serverVersion = new MySqlServerVersion(new Version(9, 6, 0));
builder.Services.AddDbContext<FeeDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));

// 3. Register Domain Services
builder.Services.AddScoped<IRazorpayPaymentService, RazorpayPaymentService>();
builder.Services.AddScoped<IFeeService, FeeService>();
builder.Services.AddScoped<IScholarshipService, ScholarshipService>();

// 4. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Ensure all fee and payment tables exist in MySQL
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FeeDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        string[] tableQueries = new[]
        {
            @"CREATE TABLE IF NOT EXISTS fee_structures (
                fee_structure_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                dept_id BIGINT NOT NULL,
                semester_id BIGINT NOT NULL,
                fee_type VARCHAR(100) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                academic_year VARCHAR(20) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;",

            @"CREATE TABLE IF NOT EXISTS student_invoices (
                invoice_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                student_id BIGINT NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                paid_amount DECIMAL(10, 2) DEFAULT 0.00,
                due_date DATETIME NOT NULL,
                status VARCHAR(30) DEFAULT 'PENDING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;",

            @"CREATE TABLE IF NOT EXISTS payments (
                payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                invoice_id BIGINT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                transaction_ref VARCHAR(255) NOT NULL,
                razorpay_order_id VARCHAR(255) NOT NULL,
                razorpay_signature VARCHAR(500),
                status VARCHAR(30) NOT NULL,
                paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES student_invoices(invoice_id) ON DELETE CASCADE
            ) ENGINE=InnoDB;",

            @"CREATE TABLE IF NOT EXISTS scholarships (
                scholarship_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(150) NOT NULL,
                eligibility_criteria TEXT,
                amount DECIMAL(10, 2) NOT NULL
            ) ENGINE=InnoDB;",

            @"CREATE TABLE IF NOT EXISTS student_scholarships (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                student_id BIGINT NOT NULL,
                scholarship_id BIGINT NOT NULL,
                awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(30) DEFAULT 'ACTIVE',
                FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id)
            ) ENGINE=InnoDB;"
        };

        foreach (var sql in tableQueries)
        {
            db.Database.ExecuteSqlRaw(sql);
        }

        logger.LogInformation("Fee, Payment & Scholarship tables verified/created successfully in university_db.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error creating fee database tables in university_db.");
    }
}

app.UseCors("AllowAll");

// Health check endpoint
app.MapGet("/", () => Results.Ok(new
{
    service = "university-fee-service",
    framework = "ASP.NET Core Web API",
    status = "healthy",
    paymentGateway = "Razorpay Test Sandbox",
    timestamp = DateTime.UtcNow
}));

app.MapControllers();

app.Run("http://0.0.0.0:5100");
