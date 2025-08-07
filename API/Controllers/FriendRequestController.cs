using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class FriendRequestController(IUnitOfWork uow) : BaseApiController
{
    [HttpPost("{memberId}")]
    public async Task<ActionResult<FriendRequest>> AddFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();

        if (currentUserMemberId == memberId) return BadRequest("Cannot send a friend request to self.");

        var existingRequest = await uow.FriendRequestRepository.GetFriendRequest(currentUserMemberId, memberId);

        if (existingRequest != null)
        {
            return BadRequest("Already sent friend request.");
        }
        else
        {
            var friendRequest = new FriendRequest
            {
                RequestedById = currentUserMemberId,
                ReceiverId = memberId,
                RequestedAt= DateTime.UtcNow,
                IsAccepted = false
            };

            uow.FriendRequestRepository.AddFriendRequest(friendRequest);

            if (await uow.Complete()) return friendRequest;

            return BadRequest("Failed to send friend request.");
        }
    }

    [HttpPost("{memberId}/accept")]
    public async Task<ActionResult> AcceptFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();

        var existingFriend = await uow.FriendRepository.GetFriend(currentUserMemberId, memberId);

        if (existingFriend == null)
        {
            var memberFriend = new MemberFriend
            {
                MemberId = currentUserMemberId,
                FriendId = memberId
            };

            var memberFriend2 = new MemberFriend
            {
                MemberId = memberId,
                FriendId = currentUserMemberId
            };

            uow.FriendRepository.AddFriend(memberFriend);
            uow.FriendRepository.AddFriend(memberFriend2);

            // Delete friend request
            var friendRequest = await uow.FriendRequestRepository.GetFriendRequest(memberId, currentUserMemberId);

            if (friendRequest != null) uow.FriendRequestRepository.AcceptFriendRequest(friendRequest);
        }
        else
        {
            return BadRequest("Already friends with this user");
        }

        if (await uow.Complete()) return Ok();

        return BadRequest("Failed to accept friend request.");
    }


    [HttpPost("{memberId}/cancel")]
    public async Task<ActionResult> CancelFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();
        var friendRequest = await uow.FriendRequestRepository.GetFriendRequest(currentUserMemberId, memberId);

        if (friendRequest == null) return BadRequest("Friend request does not exist.");

        uow.FriendRequestRepository.DeleteFriendRequest(friendRequest);

        if (await uow.Complete()) return Ok();

        return BadRequest("Failed to cancel friend request.");
    }

    [HttpPost("{memberId}/reject")]
    public async Task<ActionResult> RejectFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();
        var friendRequest = await uow.FriendRequestRepository.GetFriendRequest(memberId, currentUserMemberId);

        if (friendRequest == null) return BadRequest("Friend request does not exist.");

        uow.FriendRequestRepository.DeleteFriendRequest(friendRequest);

        if (await uow.Complete()) return Ok();

        return BadRequest("Failed to reject friend request.");
    }

    [HttpGet("friend-list")]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetCurrentMemberFriends([FromQuery]FriendRequestParams friendRequestParams)
    {
        friendRequestParams.MemberId = User.GetMemberId();
        return Ok(await uow.MemberRepository.GetMemberFriends(friendRequestParams));
    }

    [HttpGet("friend-list-ids")]
    public async Task<ActionResult<List<string>>> GetCurrentMemberFriendIds()
    {
        return Ok(await uow.MemberRepository.GetMemberFriendIds(User.GetMemberId()));
    }

    [HttpGet("list")]
    public async Task<ActionResult<PaginatedResult<FriendRequest>>> GetCurrentMemberFriendRequests(
        [FromQuery]FriendRequestParams friendRequestParams)
    {
        friendRequestParams.MemberId = User.GetMemberId();
        return Ok(await uow.FriendRequestRepository.GetMemberFriendRequests(friendRequestParams));
    }


    [HttpGet("list-ids")]
    public async Task<ActionResult<FriendRequestIdsDto>> GetCurrenMemberFriendRequestsIds()
    {
        var currentUserMemberId = User.GetMemberId();
        var sentIds = await uow.FriendRequestRepository.GetCurrentMemberRequestIds(currentUserMemberId, "sent");
        var requestedIds = await uow.FriendRequestRepository.GetCurrentMemberRequestIds(currentUserMemberId, "received");
        return new FriendRequestIdsDto
        {
            Sent = sentIds.ToList(),
            Received = requestedIds.ToList()
        };
    }
}
