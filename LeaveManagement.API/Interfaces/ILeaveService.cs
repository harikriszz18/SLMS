using LeaveManagement.API.DTOs;
using LeaveManagement.API.Models;

namespace LeaveManagement.API.Interfaces;

public interface ILeaveService
{
    Task ApplyLeaveAsync(ApplyLeaveDto leaveDto, int employeeId);
    Task<List<Leave>> GetLeaveHistoryAsync();
    Task<List<Leave>> GetLeaveHistoryAsync(int employeeId);
    Task ApproveLeaveAsync(int leaveId);
    Task RejectLeaveAsync(int leaveId);
    Task<LeaveBalanceDto> GetLeaveBalanceAsync(int employeeId);
    Task<List<Leave>> GetPendingLeavesByDepartmentAsync(string department);
    Task<List<Leave>> GetAllLeavesByDepartmentAsync(string department);
}