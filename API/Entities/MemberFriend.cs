namespace API.Entities;

public class MemberFriend
{
    public required string MemberId { get; set; }
    public Member Member { get; set; } = null!;
    public required string FriendId { get; set; }
    public Member Friend { get; set; } = null!;
}
