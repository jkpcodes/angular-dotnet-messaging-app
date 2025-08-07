using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IFriendRequestRepository
{
    Task<FriendRequest?> GetFriendRequest(string requestedById, string receiverId);
    Task<PaginatedResult<FriendRequest>> GetMemberFriendRequests(FriendRequestParams friendRequestParams);
    Task<IReadOnlyList<string>> GetCurrentMemberRequestIds(string memberId, string? predicate = null);
    void AcceptFriendRequest(FriendRequest friendRequest);
    void DeleteFriendRequest(FriendRequest friendRequest);
    void AddFriendRequest(FriendRequest friendRequest);
}