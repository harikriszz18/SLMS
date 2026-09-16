using System.Security.Claims;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManagerInsightsController : ControllerBase
{
    private readonly IJsonRepository _repository;

    public ManagerInsightsController(IJsonRepository repository)
    {
        _repository = repository;
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("my-department-stats")]
    public async Task<IActionResult> GetMyDepartmentStats([FromQuery] string? date)
    {
        // 1. Retrieve the current logged-in manager's email from JWT claims
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value
                     ?? User.FindFirst("email")?.Value;

        var allUsers = await _repository.ReadAsync<User>("users.json");
        var allLeaves = await _repository.ReadAsync<Leave>("leaves.json");

        // Find the current manager record to obtain their assigned department
        var currentManager = allUsers.FirstOrDefault(u =>
            u.Email.Equals(userEmail, StringComparison.OrdinalIgnoreCase) && u.Role == "Manager");

        string managerDept = currentManager?.Department?.Trim() ?? "";

        // Fallback check if department field in users.json is blank
        if (string.IsNullOrEmpty(managerDept))
        {
            if (userEmail?.Contains("electri", StringComparison.OrdinalIgnoreCase) == true) managerDept = "Electrification";
            else if (userEmail?.Contains("auto", StringComparison.OrdinalIgnoreCase) == true) managerDept = "Automation";
            else if (userEmail?.Contains("digi", StringComparison.OrdinalIgnoreCase) == true) managerDept = "Digitalisation";
            else managerDept = "Electrification";
        }

        DateTime targetDate = DateTime.Today;
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsedDate))
        {
            targetDate = parsedDate.Date;
        }

        // 2. Filter ONLY employees belonging to THIS manager's department
        var deptEmployees = allUsers
            .Where(u => u.Role == "Employee" &&
                        string.Equals(u.Department?.Trim(), managerDept, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var deptEmployeeIds = deptEmployees.Select(e => e.Id).ToHashSet();

        // 3. Count approved leaves for today within this department
        var onLeaveCount = allLeaves
            .Where(l => l.Status == "Approved" &&
                        deptEmployeeIds.Contains(l.EmployeeId) &&
                        DateTime.TryParse(l.StartDate, out var s) &&
                        DateTime.TryParse(l.EndDate, out var e) &&
                        targetDate >= s.Date && targetDate <= e.Date)
            .Select(l => l.EmployeeId)
            .Distinct()
            .Count();

        int totalDeptStaff = deptEmployees.Count;
        int presentCount = Math.Max(0, totalDeptStaff - onLeaveCount);

        return Ok(new
        {
            department = managerDept,
            totalWorkforce = totalDeptStaff,
            presentToday = presentCount,
            absentToday = onLeaveCount
        });
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("roster")]
    public async Task<IActionResult> GetWorkforceRoster([FromQuery] string? date)
    {
        var allUsers = await _repository.ReadAsync<User>("users.json");
        var allLeaves = await _repository.ReadAsync<Leave>("leaves.json");

        DateTime targetDate = DateTime.Today;
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsedDate))
        {
            targetDate = parsedDate.Date;
        }

        // 1. Map approved leaves covering the target date
        var activeLeavesOnDate = allLeaves
            .Where(l => l.Status == "Approved" &&
                        DateTime.TryParse(l.StartDate, out var s) &&
                        DateTime.TryParse(l.EndDate, out var e) &&
                        targetDate >= s.Date && targetDate <= e.Date)
            .ToDictionary(l => l.EmployeeId, l => l);

        // 2. Select all employees across all departments (excluding managers)
        var employees = allUsers
            .Where(u => u.Role == "Employee")
            .Select(emp =>
            {
                bool isOnLeave = activeLeavesOnDate.TryGetValue(emp.Id, out var leave);
                string dept = string.IsNullOrWhiteSpace(emp.Department) ? "General Operations" : emp.Department.Trim();

                return new
                {
                    id = emp.Id,
                    name = emp.Name,
                    email = emp.Email,
                    department = dept,
                    status = isOnLeave ? "On Leave" : "Present",
                    leaveType = isOnLeave ? leave!.LeaveType : null,
                    leaveReason = isOnLeave ? (string.IsNullOrWhiteSpace(leave!.Reason) ? "Not specified" : leave.Reason) : null,
                    leavePeriod = isOnLeave ? $"{leave!.StartDate.Split('T')[0]} to {leave.EndDate.Split('T')[0]}" : null
                };
            })
            .ToList();

        // 3. Group employees by department with present/leave tallies
        var groupedByDepartment = employees
            .GroupBy(e => e.department)
            .Select(g => new
            {
                departmentName = g.Key,
                total = g.Count(),
                present = g.Count(e => e.status == "Present"),
                onLeave = g.Count(e => e.status == "On Leave"),
                employees = g.OrderBy(e => e.name).ToList()
            })
            .OrderBy(g => g.departmentName)
            .ToList();

        int overallTotal = employees.Count;
        int overallOnLeave = employees.Count(e => e.status == "On Leave");
        int overallPresent = overallTotal - overallOnLeave;

        return Ok(new
        {
            date = targetDate.ToString("yyyy-MM-dd"),
            summary = new
            {
                totalEmployees = overallTotal,
                presentCount = overallPresent,
                onLeaveCount = overallOnLeave
            },
            departments = groupedByDepartment
        });
    }
}