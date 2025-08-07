using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IFriendRepository? _friendRepository;
    private IFriendRequestRepository? _friendRequestRepository;
    private IMemberRepository? _memberRepository;
    private IMessageRepository? _messageRepository;

    public IFriendRepository FriendRepository => _friendRepository ??= new FriendRepository(context);

    public IFriendRequestRepository FriendRequestRepository => _friendRequestRepository ??= new FriendRequestRepository(context);

    public IMemberRepository MemberRepository => _memberRepository ??= new MemberRepository(context);

    public IMessageRepository MessageRepository => _messageRepository ??= new MessageRepository(context);

    public async Task<bool> Complete()
    {
        try {
            return await context.SaveChangesAsync() > 0;
        } catch (DbUpdateException ex) {
            throw new Exception("An error occured while saving the changes", ex);
        }
    }

    public bool HasChanges()
    {
        return context.ChangeTracker.HasChanges();
    }
}