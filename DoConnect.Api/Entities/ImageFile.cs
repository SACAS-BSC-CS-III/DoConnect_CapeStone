namespace DoConnect.Api.Entities;

public class ImageFile
{
    public int Id { get; set; }
    public string Path { get; set; } = default!;
    public int? QuestionId { get; set; }
    public Question? Question { get; set; }
    public int? AnswerId { get; set; }
    public Answer? Answer { get; set; }
}
