using LeaveManagement.API.DTOs;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.API.Controllers;

public class UpdateProfilePictureDto
{
    public string Email { get; set; } = string.Empty;
    public string ProfilePicture { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IJsonRepository _repository;

    public EmployeeController(IJsonRepository repository)
    {
        _repository = repository;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterEmployeeDto dto)
    {
        var users = await _repository.ReadAsync<User>("users.json");

        if (users.Any(u => u.Email.Trim().ToLower() == dto.Email.Trim().ToLower()))
        {
            return BadRequest(new { message = "An employee with this email already exists." });
        }

        var newUser = new User
        {
            Id = users.Count > 0 ? users.Max(u => u.Id) + 1 : 1,
            Name = dto.FullName.Trim(),
            Email = dto.Email.Trim(),
            Password = dto.TemporaryPassword.Trim(),
            Role = dto.Role,
            Department = string.IsNullOrWhiteSpace(dto.Department) ? "Electrification" : dto.Department.Trim()
        };

        users.Add(newUser);
        await _repository.WriteAsync("users.json", users);

        return Ok(new
        {
            message = "Employee registered successfully",
            employee = new
            {
                fullName = newUser.Name,
                email = newUser.Email,
                temporaryPassword = newUser.Password,
                role = newUser.Role,
                department = newUser.Department
            }
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var users = await _repository.ReadAsync<User>("users.json");

        var user = users.FirstOrDefault(u => u.Email.Trim().ToLower() == dto.Email.Trim().ToLower());
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (user.Password.Trim() != dto.OldPassword.Trim())
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.Password = dto.NewPassword.Trim();
        await _repository.WriteAsync("users.json", users);

        return Ok(new { message = "Password updated successfully." });
    }

    [HttpPost("profile-picture")]
    public async Task<IActionResult> UpdateProfilePicture([FromBody] UpdateProfilePictureDto dto)
    {
        var users = await _repository.ReadAsync<User>("users.json");
        var user = users.FirstOrDefault(u => u.Email.Trim().ToLower() == dto.Email.Trim().ToLower());

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.ProfilePicture = dto.ProfilePicture;
        await _repository.WriteAsync("users.json", users);

        return Ok(new
        {
            message = "Profile picture updated successfully.",
            profilePicture = user.ProfilePicture
        });
    }

    [HttpGet("profile-picture")]
    public async Task<IActionResult> GetProfilePicture([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email is required." });
        }

        var users = await _repository.ReadAsync<User>("users.json");
        var user = users.FirstOrDefault(u => u.Email.Trim().ToLower() == email.Trim().ToLower());

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(new { profilePicture = user.ProfilePicture ?? string.Empty });
    }

    [HttpDelete("profile-picture")]
    public async Task<IActionResult> RemoveProfilePicture([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "Email is required." });
        }

        var users = await _repository.ReadAsync<User>("users.json");
        var user = users.FirstOrDefault(u => u.Email.Trim().ToLower() == email.Trim().ToLower());

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.ProfilePicture = null;
        await _repository.WriteAsync("users.json", users);

        return Ok(new { message = "Profile picture removed successfully." });
    }
}