using LeaveManagement.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LeaveManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IJsonRepository _repository;

    public NotificationController(
        INotificationService notificationService,
        IJsonRepository repository)
    {
        _notificationService = notificationService;
        _repository = repository;
    }

    private async Task<int> GetCurrentUserIdAsync()
    {
        // 1. Try from Claims
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User.FindFirst("id")?.Value
                   ?? User.FindFirst("sub")?.Value;

        if (int.TryParse(idClaim, out int parsedId) && parsedId > 0)
        {
            return parsedId;
        }

        // 2. Fallback to Email claim matched against users.json
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value
                      ?? User.FindFirst("email")?.Value;

        if (!string.IsNullOrEmpty(emailClaim))
        {
            var users = await _repository.ReadAsync<Models.User>("users.json");
            var user = users.FirstOrDefault(u => u.Email.Trim().Equals(emailClaim.Trim(), StringComparison.OrdinalIgnoreCase));
            if (user != null) return user.Id;
        }

        return 0;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        int userId = await GetCurrentUserIdAsync();
        if (userId == 0) return Ok(new List<Models.Notification>());

        var allUserNotifications = await _notificationService.GetNotificationsAsync(userId);
        var users = await _repository.ReadAsync<Models.User>("users.json");
        var currentUser = users.FirstOrDefault(u => u.Id == userId);
        string role = currentUser?.Role ?? "Employee";

        // Role-based segregation
        var filtered = allUserNotifications.Where(n =>
        {
            if (role == "Manager")
            {
                // Managers only receive inbound requests from employees
                return n.Message.StartsWith("New leave request", StringComparison.OrdinalIgnoreCase);
            }
            else
            {
                // Employees only receive personal status updates
                return n.Message.StartsWith("Your ", StringComparison.OrdinalIgnoreCase);
            }
        }).ToList();

        return Ok(filtered);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        int userId = await GetCurrentUserIdAsync();
        if (userId == 0) return Ok(new { count = 0 });

        var allUserNotifications = await _notificationService.GetNotificationsAsync(userId);
        var users = await _repository.ReadAsync<Models.User>("users.json");
        var currentUser = users.FirstOrDefault(u => u.Id == userId);
        string role = currentUser?.Role ?? "Employee";

        int count = allUserNotifications.Count(n =>
            !n.IsRead && (
                role == "Manager"
                    ? n.Message.StartsWith("New leave request", StringComparison.OrdinalIgnoreCase)
                    : n.Message.StartsWith("Your ", StringComparison.OrdinalIgnoreCase)
            )
        );

        return Ok(new { count });
    }

    [HttpPut("read/{id}")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        await _notificationService.MarkAsReadAsync(id);
        return Ok(new { message = "Marked as read" });
    }
}