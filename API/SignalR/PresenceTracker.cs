using System.Collections.Concurrent;

namespace API.SignalR;

public class PresenceTracker
{
    private static readonly ConcurrentDictionary<string,
        ConcurrentDictionary<string,byte>> OnlineUsers = new();

    public Task UserConnected(string userId, string connectionId)
    {
        // Get or add new user on the outer dictionary
        var connections = OnlineUsers.GetOrAdd(userId, _ =>
            new ConcurrentDictionary<string, byte>());
        // Add the connection Id of the user
        connections.TryAdd(connectionId, 0);

        return Task.CompletedTask;
    }

    public Task UserDisconnected(string userId, string connectionId)
    {
        if (OnlineUsers.TryGetValue(userId, out var connections))
        {
            // Remove connection from inner dictionary
            connections.TryRemove(connectionId, out _);

            // If inner connections dictionary is empty, also remove the userId from main dictionary
            if (connections.IsEmpty)
            {
                OnlineUsers.TryRemove(userId, out _);
            }
        }

        return Task.CompletedTask;
    }

    public Task<string[]> GetOnlineUsers()
    {
        return Task.FromResult(OnlineUsers.Keys.OrderBy(k => k).ToArray());
    }

    public static Task<List<string>> GetConnectionsForUser(string userId)
    {
        if (OnlineUsers.TryGetValue(userId, out var connections))
        {
            return Task.FromResult(connections.Keys.ToList());
        }

        return Task.FromResult(new List<string>());
    }
}