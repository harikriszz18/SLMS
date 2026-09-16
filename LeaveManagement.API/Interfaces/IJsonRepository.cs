namespace LeaveManagement.API.Interfaces;

public interface IJsonRepository
{
    Task<List<T>> ReadAsync<T>(string fileName);

    Task WriteAsync<T>(string fileName, List<T> data);
}
