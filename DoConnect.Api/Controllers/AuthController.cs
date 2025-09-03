using System.Security.Cryptography;
using System.Text;
using DoConnect.Api.Data;
using DoConnect.Api.Dtos;
using DoConnect.Api.Entities;
using DoConnect.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IJwtService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await db.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest("Username already exists");

        CreatePasswordHash(dto.Password, out var hash, out var salt);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = dto.IsAdmin ? UserRole.Admin : UserRole.User
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = jwt.Create(user);
        return new AuthResponseDto(token, user.Username, user.Role.ToString());
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user is null || !Verify(dto.Password, user.PasswordHash, user.PasswordSalt))
            return Unauthorized("Invalid credentials");

        var token = jwt.Create(user);
        return new AuthResponseDto(token, user.Username, user.Role.ToString());
    }

    static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
    {
        using var hmac = new HMACSHA256();
        salt = hmac.Key;
        hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
    static bool Verify(string password, byte[] hash, byte[] salt)
    {
        using var hmac = new HMACSHA256(salt);
        var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computed.SequenceEqual(hash);
    }
}
