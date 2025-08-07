using API.Entities;

namespace API.Interfaces;

public interface IFriendRepository
{
    Task<MemberFriend?> GetFriend(string currentMemberId, string memberId);
    Task<IReadOnlyList<Member>> GetMemberFriends(string memberId);
    Task<IReadOnlyList<string>> GetCurrentMemberFriendIds(string memberId);
    void DeleteFriend(MemberFriend friend);
    void AddFriend(MemberFriend friend);
}