namespace DoConnect.Api.Dtos;

public record RegisterDto(string Username, string Email, string Password, bool IsAdmin = false);
public record LoginDto(string Username, string Password);
public record AuthResponseDto(string Token, string Username, string Role);
