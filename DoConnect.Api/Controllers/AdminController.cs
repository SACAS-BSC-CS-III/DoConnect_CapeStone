using DoConnect.Api.Data;
using DoConnect.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DoConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    // --------------------------
    // 📌 USER MANAGEMENT (CRUD)
    // --------------------------

    // ✅ Get all users
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await db.Users.ToListAsync();
    }

    // ✅ Get single user
    [HttpGet("users/{id:int}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await db.Users.FindAsync(id);
        return user is null ? NotFound() : user;
    }

    // ✅ Add new user (Admin can create a user account)
    [HttpPost("users")]
    public async Task<ActionResult<User>> AddUser(string username, string password, string email, bool isAdmin = false)
    {
        if (await db.Users.AnyAsync(u => u.Username == username))
            return BadRequest("Username already exists");

        CreatePasswordHash(password, out var hash, out var salt);

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = isAdmin ? UserRole.Admin : UserRole.User
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    // ✅ Update user (email, role, password)
    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, string? email, bool? isAdmin, string? newPassword)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(email))
            user.Email = email;

        if (isAdmin.HasValue)
            user.Role = isAdmin.Value ? UserRole.Admin : UserRole.User;

        if (!string.IsNullOrWhiteSpace(newPassword))
        {
            CreatePasswordHash(newPassword, out var hash, out var salt);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    // ✅ Delete user
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --------------------------
    // 📌 CONTENT MODERATION
    // --------------------------

    [HttpGet("pending")]
    public async Task<ActionResult<object>> GetPending()
    {
        var q = await db.Questions.Where(x => x.Status == ApprovalStatus.Pending)
                  .Select(x => new { x.Id, x.Title, Type = "Question", x.CreatedAt })
                  .ToListAsync();

        var a = await db.Answers.Where(x => x.Status == ApprovalStatus.Pending)
                  .Select(x => new { x.Id, x.Body, x.QuestionId, Type = "Answer", x.CreatedAt })
                  .ToListAsync();

        return new { questions = q, answers = a };
    }

    [HttpPost("questions/{id:int}/approve")]
    public async Task<IActionResult> ApproveQuestion(int id, [FromQuery] bool approve = true)
    {
        var q = await db.Questions.FindAsync(id);
        if (q is null) return NotFound();
        q.Status = approve ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("answers/{id:int}/approve")]
    public async Task<IActionResult> ApproveAnswer(int id, [FromQuery] bool approve = true)
    {
        var a = await db.Answers.FindAsync(id);
        if (a is null) return NotFound();
        a.Status = approve ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("questions/{id:int}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var q = await db.Questions.FindAsync(id);
        if (q is null) return NotFound();
        db.Questions.Remove(q);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("answers/{id:int}")]
    public async Task<IActionResult> DeleteAnswer(int id)
    {
        var a = await db.Answers.FindAsync(id);
        if (a is null) return NotFound();
        db.Answers.Remove(a);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --------------------------
    // 📌 Helpers
    // --------------------------

    private static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
    {
        using var hmac = new HMACSHA256();
        salt = hmac.Key;
        hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    
}
