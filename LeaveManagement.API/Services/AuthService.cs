using LeaveManagement.API.DTOs;
using LeaveManagement.API.Helpers;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;

namespace LeaveManagement.API.Services;

public class AuthService : IAuthService
{
    private readonly IJsonRepository _repository;
    private readonly IConfiguration _configuration;

    public AuthService(
        IJsonRepository repository,
        IConfiguration configuration)
    {
        _repository = repository;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var users = await _repository.ReadAsync<User>("users.json");
        var user = users.FirstOrDefault(x =>
            x.Email.Trim().ToLower() == loginDto.Email.Trim().ToLower() &&
            x.Password.Trim() == loginDto.Password.Trim());

        if (user == null)
        {
            return null;
        }

        var token = JwtHelper.GenerateToken(
            user.Id,
            user.Email,
            user.Role,
            user.Department,
            _configuration["Jwt:Key"]!,
            _configuration["Jwt:Issuer"]!,
            _configuration["Jwt:Audience"]!);

        return new LoginResponseDto
        {
            Token = token,
            Role = user.Role,
            Name = user.Name,
            Department = user.Department
        };
    }
}