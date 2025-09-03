namespace DoConnect.Api.Dtos;

public record CreateQuestionDto(string Title, string Body);
public record QuestionListItemDto(int Id, string Title, string Author, string Status, DateTime CreatedAt);
public record QuestionDetailDto(int Id, string Title, string Body, string Author, string Status, DateTime CreatedAt, IEnumerable<string> ImageUrls, IEnumerable<AnswerItemDto> Answers);
public record AnswerItemDto(int Id, string Body, string Author, string Status, DateTime CreatedAt, IEnumerable<string> ImageUrls);
