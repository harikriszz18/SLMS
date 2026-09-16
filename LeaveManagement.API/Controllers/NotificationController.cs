using System.Security.Claims;
using LeaveManagement.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(
        INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = int.Parse(
            User.FindFirst("UserId")!.Value);

        var notifications =
            await _notificationService
                .GetNotificationsAsync(userId);

        return Ok(notifications);
    }
    [Authorize]
[HttpPut("read/{id}")]
public async Task<IActionResult> MarkAsRead(
    int id)
{
    await _notificationService
        .MarkAsReadAsync(id);

    return Ok("Notification marked as read.");
}
[Authorize]
[HttpGet("unread-count")]
public async Task<IActionResult> GetUnreadCount()
{
    var userId = int.Parse(
        User.FindFirst("UserId")!.Value);

    var count =
        await _notificationService
            .GetUnreadCountAsync(userId);

    return Ok(new
    {
        Count = count
    });
}
}