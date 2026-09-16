using LeaveManagement.API.DTOs;
using LeaveManagement.API.Helpers;
using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;

namespace LeaveManagement.API.Services;

public class ReportService : IReportService
{
    private readonly IJsonRepository _repository;

    public ReportService(IJsonRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var leaves =
            await _repository.ReadAsync<Leave>(
                "leaves.json");

        return new DashboardStatsDto
        {
            TotalLeaves = leaves.Count,

            ApprovedLeaves = leaves.Count(
                x => x.Status == LeaveStatus.Approved),

            RejectedLeaves = leaves.Count(
                x => x.Status == LeaveStatus.Rejected),

            PendingLeaves = leaves.Count(
                x => x.Status == LeaveStatus.Pending)
        };
    }
}