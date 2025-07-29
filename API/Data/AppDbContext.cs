using API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
  public DbSet<AppUser> Users { get; set; }
  public DbSet<Member> Members { get; set; }
  public DbSet<Photo> Photos { get; set; }
  public DbSet<MemberFriend> MemberFriends { get; set; }
  public DbSet<FriendRequest> FriendRequests { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // Set MemberFriend composite key to be MemberId and FriendId property
    modelBuilder.Entity<MemberFriend>()
      .HasKey(mf => new { mf.MemberId, mf.FriendId });

    // Configure MemberFriend relationship
    modelBuilder.Entity<MemberFriend>()
      .HasOne(mf => mf.Member)
      .WithMany(m => m.Friends)
      .HasForeignKey(mf => mf.MemberId)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<MemberFriend>()
      .HasOne(mf => mf.Friend)
      .WithMany(m => m.FriendsOf)
      .HasForeignKey(mf => mf.FriendId)
      .OnDelete(DeleteBehavior.NoAction);

    // Configure FriendRequest relationship
    modelBuilder.Entity<FriendRequest>()
      .HasOne(fr => fr.RequestedBy)
      .WithMany(m => m.SentFriendRequests)
      .HasForeignKey(fr => fr.RequestedById)
      .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<FriendRequest>()
      .HasOne(fr => fr.Receiver)
      .WithMany(m => m.ReceivedFriendRequests)
      .HasForeignKey(fr => fr.ReceiverId)
      .OnDelete(DeleteBehavior.Cascade);

    var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
      v => v.ToUniversalTime(),
      v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
    );

    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
      // Make sure to map DateTime as UTC since some databases don't save Date in UTC format
      foreach (var property in entityType.GetProperties())
      {
        if (property.ClrType == typeof(DateTime))
        {
          property.SetValueConverter(dateTimeConverter);
        }
      }
    }
  }
}
