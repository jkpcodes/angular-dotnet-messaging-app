using API.Entities;

namespace API.DTO;

public class FriendRequestDto
{
    public List<Member> Sent { get; set; }
    public List<Member> Received { get; set; }
}