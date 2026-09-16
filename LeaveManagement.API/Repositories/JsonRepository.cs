using System.Text.Json;
using LeaveManagement.API.Interfaces;

namespace LeaveManagement.API.Repositories;

public class JsonRepository : IJsonRepository
{
    private readonly string _dataFolder;

    public JsonRepository(IWebHostEnvironment environment)
    {
        _dataFolder = Path.Combine(
            environment.ContentRootPath,
            "Data");
    }

    public async Task<List<T>> ReadAsync<T>(string fileName)
    {
        var filePath = Path.Combine(_dataFolder, fileName);

        if (!File.Exists(filePath))
        {
            Console.WriteLine("File not found!");
            return new List<T>();
        }

      var json = await File.ReadAllTextAsync(filePath);

if (string.IsNullOrWhiteSpace(json))
{
    return new List<T>();
}

var data = JsonSerializer.Deserialize<List<T>>(
    json,
    new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    });

return data ?? new List<T>();
    }
    public async Task WriteAsync<T>(
    string fileName,
    List<T> data)
{
    var filePath = Path.Combine(
        _dataFolder,
        fileName);

    var json = JsonSerializer.Serialize(
        data,
        new JsonSerializerOptions
        {
            WriteIndented = true
        });

    Console.WriteLine("================================");
    Console.WriteLine($"Writing File: {filePath}");
    Console.WriteLine("JSON:");
    Console.WriteLine(json);
    Console.WriteLine("================================");

    await File.WriteAllTextAsync(
        filePath,
        json);

    Console.WriteLine("WRITE SUCCESSFUL");
}
}