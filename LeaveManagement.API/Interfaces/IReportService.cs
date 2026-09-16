using LeaveManagement.API.DTOs;

namespace LeaveManagement.API.Interfaces;

public interface IReportService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}