namespace LeaveManagement.API.DTOs;

public class LeaveBalanceDto
{
    public int TotalLeaves { get; set; }

    public int UsedLeaves { get; set; }

    public int RemainingLeaves { get; set; }
}