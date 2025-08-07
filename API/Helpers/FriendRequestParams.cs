namespace API.Helpers;

public class FriendRequestParams : PagingParams
{
    public string MemberId { get; set; } = "";
    public string Predicate { get; set; } = "";
}