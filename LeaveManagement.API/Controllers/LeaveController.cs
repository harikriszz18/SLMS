using LeaveManagement.API.DTOs;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    private readonly IJsonRepository _repository;

    public LeaveController(ILeaveService leaveService, IJsonRepository repository)
    {
        _leaveService = leaveService;
        _repository = repository;
    }

    private async Task<int> GetAuthenticatedUserIdAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("nameid")?.Value
                          ?? User.FindFirst("sub")?.Value
                          ?? User.FindFirst("id")?.Value
                          ?? User.FindFirst("UserId")?.Value;

        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int id))
        {
            return id;
        }

        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value
                         ?? User.FindFirst("email")?.Value;

        if (!string.IsNullOrEmpty(emailClaim))
        {
            var users = await _repository.ReadAsync<User>("users.json");
            var matched = users.FirstOrDefault(u => u.Email.Trim().ToLower() == emailClaim.Trim().ToLower());
            if (matched != null) return matched.Id;
        }

        return 0;
    }

    private async Task<string> GetAuthenticatedDepartmentAsync()
    {
        var deptClaim = User.FindFirst("Department")?.Value
                        ?? User.FindFirst("department")?.Value;

        if (!string.IsNullOrEmpty(deptClaim))
        {
            return deptClaim;
        }

        int userId = await GetAuthenticatedUserIdAsync();
        if (userId > 0)
        {
            var users = await _repository.ReadAsync<User>("users.json");
            var user = users.FirstOrDefault(u => u.Id == userId);
            if (user != null && !string.IsNullOrEmpty(user.Department))
            {
                return user.Department;
            }
        }

        return string.Empty;
    }

    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> ApplyLeave([FromBody] ApplyLeaveDto leaveDto)
    {
        int employeeId = await GetAuthenticatedUserIdAsync();
        if (employeeId <= 0)
        {
            return Unauthorized(new { message = "Invalid authentication session. Please sign in again." });
        }

        await _leaveService.ApplyLeaveAsync(leaveDto, employeeId);
        return Ok(new { message = "Leave application registered successfully." });
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        int employeeId = await GetAuthenticatedUserIdAsync();
        if (employeeId <= 0)
        {
            return Unauthorized(new { message = "Invalid authentication session." });
        }

        var users = await _repository.ReadAsync<User>("users.json");
        var allLeaves = await _repository.ReadAsync<Leave>("leaves.json");
        var userMap = users.ToDictionary(u => u.Id, u => u);

        var employeeLeaves = allLeaves
            .Where(l => l.EmployeeId == employeeId)
            .Select(l => new
            {
                l.Id,
                l.EmployeeId,
                EmployeeName = userMap.TryGetValue(l.EmployeeId, out var u) ? u.Name : $"Employee #{l.EmployeeId}",
                EmployeeEmail = userMap.TryGetValue(l.EmployeeId, out var em) ? em.Email : "",
                Department = userMap.TryGetValue(l.EmployeeId, out var dep) ? dep.Department : "",
                l.LeaveType,
                l.StartDate,
                l.EndDate,
                l.Reason,
                l.Status
            })
            .ToList();

        return Ok(employeeLeaves);
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingLeaves()
    {
        var managerDept = await GetAuthenticatedDepartmentAsync();
        var users = await _repository.ReadAsync<User>("users.json");
        var allLeaves = await _repository.ReadAsync<Leave>("leaves.json");

        var userMap = users.ToDictionary(u => u.Id, u => u);
        var pendingLeaves = allLeaves.Where(x => x.Status == "Pending").ToList();

        if (!string.IsNullOrEmpty(managerDept))
        {
            var deptEmployeeIds = users
                .Where(u => !string.IsNullOrEmpty(u.Department) &&
                            u.Department.Trim().Equals(managerDept.Trim(), StringComparison.OrdinalIgnoreCase))
                .Select(u => u.Id)
                .ToHashSet();

            pendingLeaves = pendingLeaves.Where(l => deptEmployeeIds.Contains(l.EmployeeId)).ToList();
        }

        var result = pendingLeaves.Select(l => new
        {
            l.Id,
            l.EmployeeId,
            EmployeeName = userMap.TryGetValue(l.EmployeeId, out var u) ? u.Name : $"Employee #{l.EmployeeId}",
            EmployeeEmail = userMap.TryGetValue(l.EmployeeId, out var em) ? em.Email : "",
            Department = userMap.TryGetValue(l.EmployeeId, out var dep) ? dep.Department : "",
            l.LeaveType,
            l.StartDate,
            l.EndDate,
            l.Reason,
            l.Status
        }).ToList();

        return Ok(result);
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("approve/{id}")]
    public async Task<IActionResult> ApproveLeave(int id)
    {
        await _leaveService.ApproveLeaveAsync(id);
        return Ok("Leave Approved Successfully");
    }

    [Authorize(Roles = "Manager")]
    [HttpPut("reject/{id}")]
    public async Task<IActionResult> RejectLeave(int id)
    {
        await _leaveService.RejectLeaveAsync(id);
        return Ok("Leave Rejected Successfully");
    }

    [Authorize]
    [HttpGet("balance")]
    public async Task<IActionResult> GetLeaveBalance()
    {
        int userId = await GetAuthenticatedUserIdAsync();
        if (userId <= 0)
        {
            return Unauthorized(new { message = "Invalid authentication session." });
        }

        var balance = await _leaveService.GetLeaveBalanceAsync(userId);
        return Ok(balance);
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllLeaves()
    {
        var managerDept = await GetAuthenticatedDepartmentAsync();
        var users = await _repository.ReadAsync<User>("users.json");
        var allLeaves = await _repository.ReadAsync<Leave>("leaves.json");

        var userMap = users.ToDictionary(u => u.Id, u => u);

        if (!string.IsNullOrEmpty(managerDept))
        {
            var deptEmployeeIds = users
                .Where(u => !string.IsNullOrEmpty(u.Department) &&
                            u.Department.Trim().Equals(managerDept.Trim(), StringComparison.OrdinalIgnoreCase))
                .Select(u => u.Id)
                .ToHashSet();

            allLeaves = allLeaves.Where(l => deptEmployeeIds.Contains(l.EmployeeId)).ToList();
        }

        var result = allLeaves.Select(l => new
        {
            l.Id,
            l.EmployeeId,
            EmployeeName = userMap.TryGetValue(l.EmployeeId, out var u) ? u.Name : $"Employee #{l.EmployeeId}",
            EmployeeEmail = userMap.TryGetValue(l.EmployeeId, out var em) ? em.Email : "",
            Department = userMap.TryGetValue(l.EmployeeId, out var dep) ? dep.Department : "",
            l.LeaveType,
            l.StartDate,
            l.EndDate,
            l.Reason,
            l.Status
        }).ToList();

        return Ok(result);
    }
}