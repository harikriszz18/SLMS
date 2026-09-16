using LeaveManagement.API.Interfaces;
using LeaveManagement.API.Models;

namespace LeaveManagement.API.Services;

public class NotificationService : INotificationService
{
    private readonly IJsonRepository _repository;

    public NotificationService(
        IJsonRepository repository)
    {
        _repository = repository;
    }

    public async Task CreateNotificationAsync(
        int userId,
        string message)
    {
        var notifications =
            await _repository.ReadAsync<Notification>(
                "notifications.json");

        var notification = new Notification
        {
            Id = notifications.Count + 1,
            UserId = userId,
            Message = message,
            CreatedAt = DateTime.Now,
            IsRead = false
        };

        notifications.Add(notification);

        await _repository.WriteAsync(
            "notifications.json",
            notifications);
    }

    public async Task<List<Notification>> GetNotificationsAsync(
        int userId)
    {
        var notifications =
            await _repository.ReadAsync<Notification>(
                "notifications.json");

        return notifications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }

    public async Task MarkAsReadAsync(
    int notificationId)
{
    var notifications =
        await _repository.ReadAsync<Notification>(
            "notifications.json");

    var notification =
        notifications.FirstOrDefault(
            x => x.Id == notificationId);

    if (notification == null)
    {
        return;
    }

    notification.IsRead = true;

    await _repository.WriteAsync(
        "notifications.json",
        notifications);
}
public async Task<int> GetUnreadCountAsync(
    int userId)
{
    var notifications =
        await _repository.ReadAsync<Notification>(
            "notifications.json");

    return notifications.Count(x =>
        x.UserId == userId &&
        !x.IsRead);
}
    public async Task MarkAsRead(int id)
    {
        var notifications =
            await _repository.ReadAsync<Notification>(
                "notifications.json");

        var notification =
            notifications.FirstOrDefault(
                n => n.Id == id);

        if (notification != null)
        {
            notification.IsRead = true;

            await _repository.WriteAsync(
                "notifications.json",
                notifications);
        }
    }
}