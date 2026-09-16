using LeaveManagement.API.Models;

namespace LeaveManagement.API.Interfaces;

public interface INotificationService
{
    Task CreateNotificationAsync(
        int userId,
        string message);

    Task<List<Notification>> GetNotificationsAsync(
        int userId);

    Task MarkAsReadAsync(int notificationId);
    Task<int> GetUnreadCountAsync(int userId);
}