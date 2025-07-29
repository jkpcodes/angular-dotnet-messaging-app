using API.DTO;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class FriendRequestController(IFriendRequestRepository friendRequestRepository, IFriendRepository friendRepository,
    IMemberRepository memberRepository) : BaseApiController
{
    [HttpPost("{memberId}")]
    public async Task<ActionResult<FriendRequest>> AddFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();

        if (currentUserMemberId == memberId) return BadRequest("Cannot send a friend request to self.");

        var existingRequest = await friendRequestRepository.GetFriendRequest(currentUserMemberId, memberId);

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

            friendRequestRepository.AddFriendRequest(friendRequest);

            if (await friendRequestRepository.SaveAllChanges()) return friendRequest;

            return BadRequest("Failed to send friend request.");
        }
    }

    [HttpPost("{memberId}/accept")]
    public async Task<ActionResult> AcceptFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();

        var existingFriend = await friendRepository.GetFriend(currentUserMemberId, memberId);

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

            friendRepository.AddFriend(memberFriend);
            friendRepository.AddFriend(memberFriend2);

            // Delete friend request
            var friendRequest = await friendRequestRepository.GetFriendRequest(memberId, currentUserMemberId);

            if (friendRequest != null) friendRequestRepository.AcceptFriendRequest(friendRequest);
        }
        else
        {
            return BadRequest("Already friends with this user");
        }

        if (await friendRepository.SaveAllChanges()) return Ok();

        return BadRequest("Failed to accept friend request.");
    }


    [HttpPost("{memberId}/cancel")]
    public async Task<ActionResult> CancelFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();
        var friendRequest = await friendRequestRepository.GetFriendRequest(currentUserMemberId, memberId);

        if (friendRequest == null) return BadRequest("Friend request does not exist.");

        friendRequestRepository.DeleteFriendRequest(friendRequest);

        if (await friendRequestRepository.SaveAllChanges()) return Ok();

        return BadRequest("Failed to cancel friend request.");
    }

    [HttpPost("{memberId}/reject")]
    public async Task<ActionResult> RejectFriendRequest(string memberId)
    {
        var currentUserMemberId = User.GetMemberId();
        var friendRequest = await friendRequestRepository.GetFriendRequest(memberId, currentUserMemberId);

        if (friendRequest == null) return BadRequest("Friend request does not exist.");

        friendRequestRepository.DeleteFriendRequest(friendRequest);

        if (await friendRequestRepository.SaveAllChanges()) return Ok();

        return BadRequest("Failed to reject friend request.");
    }

    [HttpGet("friend-list")]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetCurrentMemberFriends([FromQuery]FriendRequestParams friendRequestParams)
    {
        friendRequestParams.MemberId = User.GetMemberId();
        return Ok(await memberRepository.GetMemberFriends(friendRequestParams));
    }

    [HttpGet("list")]
    public async Task<ActionResult<PaginatedResult<FriendRequest>>> GetCurrentMemberFriendRequests(
        [FromQuery]FriendRequestParams friendRequestParams)
    {
        friendRequestParams.MemberId = User.GetMemberId();
        return Ok(await friendRequestRepository.GetMemberFriendRequests(friendRequestParams));
    }


    [HttpGet("list-ids")]
    public async Task<ActionResult<FriendRequestIdsDto>> GetCurrenMemberFriendRequestsIds()
    {
        var currentUserMemberId = User.GetMemberId();
        var sentIds = await friendRequestRepository.GetCurrentMemberRequestIds(currentUserMemberId, "sent");
        var requestedIds = await friendRequestRepository.GetCurrentMemberRequestIds(currentUserMemberId, "received");
        return new FriendRequestIdsDto
        {
            Sent = sentIds.ToList(),
            Received = requestedIds.ToList()
        };
    }
}
