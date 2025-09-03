namespace DoConnect.Api.Entities;

public enum ApprovalStatus { Pending = 0, Approved = 1, Rejected = 2 }

public class Question
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Title { get; set; } = default!;
    public string Body { get; set; } = default!;
    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<ImageFile> Images { get; set; } = new List<ImageFile>();
}
