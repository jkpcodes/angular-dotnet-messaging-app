namespace API.Entities;

public class FriendRequest
{
    public int Id { get; set; }
    public string RequestedById { get; set; }
    public Member RequestedBy { get; set; } = null!;
    public string ReceiverId { get; set; }
    public Member Receiver { get; set; } = null!;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public bool IsAccepted { get; set; } = false;
}