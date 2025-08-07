using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class FriendRepository(AppDbContext context) : IFriendRepository
{
    public void AddFriend(MemberFriend friend)
    {
        context.MemberFriends.Add(friend);
    }

    public void DeleteFriend(MemberFriend friend)
    {
        context.MemberFriends.Remove(friend);
    }

    public async Task<IReadOnlyList<string>> GetCurrentMemberFriendIds(string memberId)
    {
        return await context.MemberFriends
            .Where(x => x.MemberId == memberId)
            .Select(x => x.FriendId)
            .ToListAsync();
    }

    public async Task<MemberFriend?> GetFriend(string currentMemberId, string memberId)
    {
        return await context.MemberFriends.FindAsync(currentMemberId, memberId);
    }

    public async Task<IReadOnlyList<Member>> GetMemberFriends(string memberId)
    {
        var query = context.MemberFriends.AsQueryable();

        return await query
            .Where(x => x.MemberId == memberId)
            .Include(x => x.Friend)
            .Select(x => x.Friend)
            .ToListAsync();
    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}