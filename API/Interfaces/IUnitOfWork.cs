namespace API.Interfaces;

public interface IUnitOfWork
{
    IFriendRepository FriendRepository { get; }
    IFriendRequestRepository FriendRequestRepository { get; }
    IMemberRepository MemberRepository { get; }
    IMessageRepository MessageRepository { get; }
    Task<bool> Complete();
    bool HasChanges();
}