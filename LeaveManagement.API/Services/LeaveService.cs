using LeaveManagement.API.DTOs;
using LeaveManagement.API.Helpers;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;

namespace LeaveManagement.API.Services;

public class LeaveService : ILeaveService
{
    private readonly IJsonRepository _repository;
    private readonly INotificationService _notificationService;

    public LeaveService(
        IJsonRepository repository,
        INotificationService notificationService)
    {
        _repository = repository;
        _notificationService = notificationService;
    }

    private async Task<List<Leave>> EnrichLeavesWithUserDetailsAsync(List<Leave> leaves)
    {
        var users = await _repository.ReadAsync<User>("users.json");
        var userMap = users.ToDictionary(u => u.Id, u => u);

        foreach (var leave in leaves)
        {
            if (userMap.TryGetValue(leave.EmployeeId, out var user))
            {
                leave.EmployeeName = user.Name;
                leave.EmployeeEmail = user.Email;
            }
            else
            {
                leave.EmployeeName = $"Employee #{leave.EmployeeId}";
                leave.EmployeeEmail = string.Empty;
            }
        }

        return leaves;
    }

    public async Task ApplyLeaveAsync(ApplyLeaveDto leaveDto, int employeeId)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");

        var leave = new Leave
        {
            Id = leaves.Count > 0 ? leaves.Max(x => x.Id) + 1 : 1,
            EmployeeId = employeeId,
            LeaveType = leaveDto.LeaveType ?? string.Empty,
            StartDate = leaveDto.StartDate.ToString("yyyy-MM-dd"),
            EndDate = leaveDto.EndDate.ToString("yyyy-MM-dd"),
            Reason = leaveDto.Reason ?? string.Empty,
            Status = LeaveStatus.Pending
        };

        leaves.Add(leave);
        await _repository.WriteAsync("leaves.json", leaves);

        await _notificationService.CreateNotificationAsync(
            employeeId,
            "Leave request submitted successfully.");
    }

    public async Task<List<Leave>> GetLeaveHistoryAsync(int employeeId)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var userLeaves = leaves.Where(x => x.EmployeeId == employeeId).ToList();
        return await EnrichLeavesWithUserDetailsAsync(userLeaves);
    }

    public async Task<List<Leave>> GetLeaveHistoryAsync()
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        return await EnrichLeavesWithUserDetailsAsync(leaves);
    }

    public async Task<List<Leave>> GetPendingLeavesByDepartmentAsync(string department)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var users = await _repository.ReadAsync<User>("users.json");

        // Collect IDs of all employees in this manager's department
        var deptEmployeeIds = users
            .Where(u => u.Department.Trim().Equals(department.Trim(), StringComparison.OrdinalIgnoreCase))
            .Select(u => u.Id)
            .ToHashSet();

        return leaves
            .Where(x => x.Status == LeaveStatus.Pending && deptEmployeeIds.Contains(x.EmployeeId))
            .ToList();
    }

    public async Task ApproveLeaveAsync(int leaveId)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var leave = leaves.FirstOrDefault(x => x.Id == leaveId);
        if (leave == null) return;

        leave.Status = LeaveStatus.Approved;
        await _notificationService.CreateNotificationAsync(
            leave.EmployeeId,
            "Your leave request has been approved.");
        await _repository.WriteAsync("leaves.json", leaves);
    }

    public async Task RejectLeaveAsync(int leaveId)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var leave = leaves.FirstOrDefault(x => x.Id == leaveId);
        if (leave == null) return;

        leave.Status = LeaveStatus.Rejected;
        await _notificationService.CreateNotificationAsync(
            leave.EmployeeId,
            "Your leave request has been rejected.");
        await _repository.WriteAsync("leaves.json", leaves);
    }

    public async Task<LeaveBalanceDto> GetLeaveBalanceAsync(int employeeId)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var approvedLeaves = leaves
            .Where(x => x.EmployeeId == employeeId && x.Status == LeaveStatus.Approved)
            .ToList();

        var usedLeaves = approvedLeaves.Count;
        var totalLeaves = 24;

        return new LeaveBalanceDto
        {
            TotalLeaves = totalLeaves,
            UsedLeaves = usedLeaves,
            RemainingLeaves = totalLeaves - usedLeaves
        };
    }

    public async Task<List<Leave>> GetAllLeavesByDepartmentAsync(string department)
    {
        var leaves = await _repository.ReadAsync<Leave>("leaves.json");
        var users = await _repository.ReadAsync<User>("users.json");

        var deptEmployeeIds = users
            .Where(u => u.Department.Trim().Equals(department.Trim(), StringComparison.OrdinalIgnoreCase))
            .Select(u => u.Id)
            .ToHashSet();

        return leaves
            .Where(x => deptEmployeeIds.Contains(x.EmployeeId))
            .ToList();
    }
}