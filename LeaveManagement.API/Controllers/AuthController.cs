using LeaveManagement.API.DTOs;
using LeaveManagement.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
public async Task<IActionResult> Login(LoginDto loginDto)
{
    Console.WriteLine(loginDto.Email);
    Console.WriteLine(loginDto.Password);

    var result = await _authService.LoginAsync(loginDto);

    if (result == null)
    {
        return Unauthorized("Invalid email or password");
    }

    return Ok(result);
}
}