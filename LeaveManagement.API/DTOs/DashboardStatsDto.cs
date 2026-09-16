namespace LeaveManagement.API.DTOs;

public class DashboardStatsDto
{
    public int TotalLeaves { get; set; }

    public int ApprovedLeaves { get; set; }

    public int RejectedLeaves { get; set; }

    public int PendingLeaves { get; set; }
}