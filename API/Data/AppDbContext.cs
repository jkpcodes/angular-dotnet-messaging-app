using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
  public DbSet<AppUser> Users { get; set; }
  public DbSet<Member> Members { get; set; }
  public DbSet<Photo> Photos { get; set; }
  public DbSet<MemberFriend> MemberFriends { get; set; }
  public DbSet<FriendRequest> FriendRequests { get; set; }
  public DbSet<Message> Messages { get; set; }
  public DbSet<Group> Groups { get; set; }
  public DbSet<Connection> Connections { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<IdentityRole>()
      .HasData(
        new IdentityRole{Id = "member-id", Name = "Member", NormalizedName = "MEMBER"},
        new IdentityRole{Id = "moderator-id", Name = "Moderator", NormalizedName = "MODERATOR"},
        new IdentityRole{Id = "admin-id", Name = "Admin", NormalizedName = "ADMIN"}
      );

    modelBuilder.Entity<Message>()
      .HasOne(m => m.Recipient)
      .WithMany(m => m.MessagesReceived)
      .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Message>()
      .HasOne(m => m.Sender)
      .WithMany(m => m.MessagesSent)
      .OnDelete(DeleteBehavior.Restrict);

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

    var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
      v => v.HasValue ? v.Value.ToUniversalTime() : null,
      v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
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
        else if (property.ClrType == typeof(DateTime?))
        {
          property.SetValueConverter(nullableDateTimeConverter);
        }
      }
    }
  }
}
