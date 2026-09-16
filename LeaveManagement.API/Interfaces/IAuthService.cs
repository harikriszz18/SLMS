using LeaveManagement.API.DTOs;

namespace LeaveManagement.API.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
}