using System.Text.Json;
using System.Text.Json.Serialization;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Middleware;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using NewRelic.LogEnrichers.Serilog;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Hook Serilog into ASP.NET Core
var env = builder.Environment.EnvironmentName;
Log.Information("Current environment: {Environment}", env);

// Partly \fFiler permssions woes, but also colocating convenice on dev.
var logFileDirectory = env == "Production" ? "/var/log/lift-tracker-api" : "logs";
var logFilePath = $"{logFileDirectory}/log.ndjson";

// Rotate the existing file if it exists,
// we do this "manually" because new relic ingestion is easiest with a static log file path (and this is only a toy app).
if (File.Exists(logFilePath))
{
    var backupFileName = $"{logFileDirectory}/log-{DateTime.UtcNow:yyyy-MM-dd-HH-mm-ss}.ndjson";
    File.Delete(backupFileName);
    File.Move(logFilePath, backupFileName);
}

Log.Logger = new LoggerConfiguration()
    .Enrich.WithNewRelicLogsInContext() // correlates logs with APM traces
    .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
    .WriteTo.File(
        new Serilog.Formatting.Json.JsonFormatter(renderMessage: true),
        logFilePath,
        shared: true, // allows multiple processes to write safely
        fileSizeLimitBytes: 10_000_000 // optional 10MB max per file
    )
    .CreateLogger();

builder.Host.UseSerilog();
Log.Logger.Information("Building application");

// Allow CORS for the frontend (Vue dev server on localhost).
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowVueDev",
        policy =>
        {
            policy
                .SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add the database context.
builder.Services.AddDbContext<LiftTrackerDbContext>();

// Add the service layer.
builder.Services.AddScoped<DomainEntityService>();
builder.Services.AddScoped<WorkoutProgramService>();
builder.Services.AddScoped<WorkoutSessionService>();
builder.Services.AddScoped<ProgressionSchemeRegistry>();
builder.Services.AddScoped<IProgressionSchemeStrategy, FiveThreeOneProgressionStrategy>();

// Add default JSON options.
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.IgnoreReadOnlyProperties = true;
    });

// Auth0 jwt bearer authentication.
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}";
        options.Audience = builder.Configuration["Auth0:Audience"];
    });

// Add authorization policies to every controller by default.
builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();

    options.Filters.Add(new AuthorizeFilter(policy));
});

var app = builder.Build();

// Not sure if this is working.
app.UseStatusCodePages(async context =>
{
    var response = context.HttpContext.Response;

    // Only customize known codes; leave 200, 201, etc. untouched
    if (response.StatusCode >= 400)
    {
        response.ContentType = "application/json";
        var json = JsonSerializer.Serialize(new { error = $"Error {response.StatusCode}" });
        await response.WriteAsync(json);
    }
});

// Configure the HTTP request pipeline.
if (app.Environment.IsProduction())
{
    Log.Logger.Information("Running application in production mode");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    Log.Logger.Information("Running application in local development mode, serving at http://localhost:5299/api/");
    app.UseCors("AllowVueDev");
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<UserIdMiddleware>();
app.UseMiddleware<JsonExceptionMiddleware>();
app.MapControllers();

// Run db migrations on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LiftTrackerDbContext>();
    db.Database.Migrate();
}

Log.Logger.Information("Running application");
app.Run();

public partial class Program { }
