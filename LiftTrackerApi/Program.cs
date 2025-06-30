using System.Text.Json.Serialization;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Middleware;
using LiftTrackerApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add the database context.
builder.Services.AddDbContext<LiftTrackerDbContext>();

// Add the service layer.
builder.Services.AddScoped<WorkoutProgramService>();

// Add default JSON options.
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.IgnoreReadOnlyProperties = true;
    });

var app = builder.Build();

app.UseMiddleware<JsonExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
        "workout-programs",
        "workout-programs/{action=Index}/{routine-uuid?}",
        new { controller = "WorkoutProgram", action = "Index" }
    )
    .RequireAuthorization();

app.MapControllerRoute(
        "routines",
        "routines/{action=Index}",
        new { controller = "WorkoutProgramRoutine", action = "Index" }
    )
    .RequireAuthorization();

app.Run();

public partial class Program { }
