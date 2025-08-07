using API.Entities;

namespace API.DTO;

public class FriendRequestIdsDto
{
    public List<string> Sent { get; set; }
    public List<string> Received { get; set; }
}