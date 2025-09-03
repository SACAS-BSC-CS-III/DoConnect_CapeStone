namespace DoConnect.Api.Entities;

public class Answer
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public Question? Question { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string Body { get; set; } = default!;
    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<ImageFile> Images { get; set; } = new List<ImageFile>();
}
