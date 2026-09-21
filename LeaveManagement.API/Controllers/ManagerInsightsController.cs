using System.Globalization;
using System.Security.Claims;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.API.Controllers;

[Authorize(Roles = "Manager")]
[ApiController]
[Route("api/[controller]")]
public class ManagerInsightsController : ControllerBase
{
    private readonly IJsonRepository _repository;

    public ManagerInsightsController(IJsonRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("absences")]
    public async Task<IActionResult> GetAbsences([FromQuery] string? date)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var users = await _repository.ReadAsync<User>("users.json");

        DateTime targetDate = DateTime.Today;
        if (!string.IsNullOrWhiteSpace(date))
        {
            if (DateTime.TryParse(date, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            {
                targetDate = parsed.Date;
            }
            else if (DateTime.TryParse(date, out var parsedLocal))
            {
                targetDate = parsedLocal.Date;
            }
        }

        var absentRecords = leaves
            .Where(l =>
            {
                var status = (l.Status ?? string.Empty).Trim();
                if (!status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }

                if (!DateTime.TryParse(l.StartDate?.ToString(), CultureInfo.InvariantCulture, DateTimeStyles.None, out var sDate) &&
                    !DateTime.TryParse(l.StartDate?.ToString(), out sDate))
                {
                    return false;
                }

                if (!DateTime.TryParse(l.EndDate?.ToString(), CultureInfo.InvariantCulture, DateTimeStyles.None, out var eDate) &&
                    !DateTime.TryParse(l.EndDate?.ToString(), out eDate))
                {
                    return false;
                }

                return targetDate >= sDate.Date && targetDate <= eDate.Date;
            })
            .Select(l =>
            {
                var user = users.FirstOrDefault(u => u.Id == l.EmployeeId);
                return new
                {
                    employeeId = l.EmployeeId,
                    employeeName = !string.IsNullOrWhiteSpace(l.EmployeeName)
                        ? l.EmployeeName
                        : user?.Name ?? $"Employee #{l.EmployeeId}",
                    department = !string.IsNullOrWhiteSpace(user?.Department)
                        ? user.Department
                        : "Operations",
                    leaveType = l.LeaveType,
                    startDate = l.StartDate,
                    endDate = l.EndDate,
                    status = l.Status
                };
            })
            .ToList();

        return Ok(absentRecords);
    }

    [HttpGet("my-department-stats")]
    public async Task<IActionResult> GetMyDepartmentStats([FromQuery] string? date)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value
                     ?? User.FindFirst("email")?.Value;

        var allUsers = await _repository.ReadAsync<User>("users.json");
        var allLeaves = await _repository.ReadAsync<Leave>("leaves.json");

        var currentManager = allUsers.FirstOrDefault(u =>
            u.Email.Equals(userEmail, StringComparison.OrdinalIgnoreCase) && u.Role == "Manager");

        string managerDept = currentManager?.Department?.Trim() ?? "";

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

        var deptEmployees = allUsers
            .Where(u => u.Role == "Employee" &&
                        string.Equals(u.Department?.Trim(), managerDept, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var deptEmployeeIds = deptEmployees.Select(e => e.Id).ToHashSet();

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

        var activeLeavesOnDate = allLeaves
            .Where(l => l.Status == "Approved" &&
                        DateTime.TryParse(l.StartDate, out var s) &&
                        DateTime.TryParse(l.EndDate, out var e) &&
                        targetDate >= s.Date && targetDate <= e.Date)
            .ToDictionary(l => l.EmployeeId, l => l);

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