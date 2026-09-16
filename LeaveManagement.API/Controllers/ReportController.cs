using LeaveManagement.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(
        IReportService reportService)
    {
        _reportService = reportService;
    }

    [Authorize]
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var stats =
            await _reportService
                .GetDashboardStatsAsync();

        return Ok(stats);
    }
}