namespace LeaveManagement.API.Models;

public class Leave
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ManagerComment { get; set; }

    // Enriched fields populated from users.json
    public string? EmployeeName { get; set; }
    public string? EmployeeEmail { get; set; }
}