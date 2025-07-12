using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LiftTrackerApi.Controllers;

[ApiController]
[AllowAnonymous]
[Route("")]
public class Index() : Controller
{
    [HttpGet]
    public OkObjectResult Get()
    {
        return Ok(
            new
            {
                message = "Welcome to the Lift Tracker API",
                version = "1.0.0",
                author = "jaronsteenson@gmail.com",
            }
        );
    }
}
