namespace DoConnect.Api.Entities;

public enum UserRole { User = 0, Admin = 1 }

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = default!;
    public string Email { get; set; } = default!;
    public byte[] PasswordHash { get; set; } = default!;
    public byte[] PasswordSalt { get; set; } = default!;
    public UserRole Role { get; set; } = UserRole.User;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
}
