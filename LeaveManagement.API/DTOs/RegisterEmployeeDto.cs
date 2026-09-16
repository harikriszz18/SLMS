namespace LeaveManagement.API.DTOs;

public class RegisterEmployeeDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = "Electrification";
    public string Role { get; set; } = "Employee";
    public string TemporaryPassword { get; set; } = string.Empty;
}