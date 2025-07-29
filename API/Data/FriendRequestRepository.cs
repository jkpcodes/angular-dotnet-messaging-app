using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class FriendRequestRepository(AppDbContext context) : IFriendRequestRepository
{
    public void AddFriendRequest(FriendRequest friendRequest)
    {
        // throw new NotImplementedException();
        context.FriendRequests.Add(friendRequest);
    }

    public void DeleteFriendRequest(FriendRequest friendRequest)
    {
        context.FriendRequests.Remove(friendRequest);
    }

    public async Task<IReadOnlyList<string>> GetCurrentMemberRequestIds(string memberId, string? predicate = null)
    {
        // throw new NotImplementedException();
        var query = context.FriendRequests.AsQueryable()
            .Where(x => !x.IsAccepted);

        if (predicate == "sent")
        {
            return await query.Where(x => x.RequestedById == memberId)
                .Select(x => x.ReceiverId)
                .ToListAsync();
        }
        else
        {
            return await query.Where(x => x.ReceiverId == memberId)
                .Select(x => x.RequestedById)
                .ToListAsync();
        }
    }

    public async Task<FriendRequest?> GetFriendRequest(string requestedById, string receiverId)
    {
        return await context.FriendRequests
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.RequestedById == requestedById && x.ReceiverId == receiverId);
    }

    public async Task<PaginatedResult<FriendRequest>> GetMemberFriendRequests(FriendRequestParams friendRequestParams)
    {
        IQueryable<FriendRequest> result;
        var query = context.FriendRequests.AsQueryable()
            .Where(x => !x.IsAccepted);

        if (friendRequestParams.Predicate == "sent")
        {
            result = query.Where(x => x.RequestedById == friendRequestParams.MemberId)
                .Include(x => x.Receiver);
        }
        else if (friendRequestParams.Predicate == "received")
        {
            result = query.Where(x => x.ReceiverId == friendRequestParams.MemberId)
                .Include(x => x.RequestedBy);
        }
        else
        {
            result = query.Where(x => x.RequestedById == friendRequestParams.MemberId || x.ReceiverId == friendRequestParams.MemberId)
                .Include(x => x.Receiver)
                .Include(x => x.RequestedBy);
        }

        return await PaginationHelper.CreateAsync(result, friendRequestParams.PageNumber, friendRequestParams.PageSize);
    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void AcceptFriendRequest(FriendRequest friendRequest)
    {
        context.FriendRequests
            .Where(x => x.Id == friendRequest.Id)
            .ExecuteUpdate(x => x.SetProperty(fr => fr.IsAccepted, true));
    }
}