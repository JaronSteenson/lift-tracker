using System.Text.Json.Serialization;
using LiftTrackerApi.Entities;
using LiftTrackerApi.Middleware;
using LiftTrackerApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Allow CORS for the frontend (Vue dev server on localhost:8081).
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowVueDev",
        policy =>
        {
            policy.WithOrigins("http://localhost:8081").AllowAnyHeader().AllowAnyMethod();
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
        options.Authority = "https://dev-tjfr6n7ocu2ifro1.us.auth0.com/";
        options.Audience = "https://dev.lift-tracker.app";
    });

// Add authorization policies to every controller by default.
builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();

    options.Filters.Add(new AuthorizeFilter(policy));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsProduction())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    app.UseCors("AllowVueDev");
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<UserIdMiddleware>();
app.UseMiddleware<JsonExceptionMiddleware>();
app.MapControllers();

app.Run();

public partial class Program { }
