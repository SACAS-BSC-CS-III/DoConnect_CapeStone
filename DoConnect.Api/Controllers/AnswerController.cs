using DoConnect.Api.Data;
using DoConnect.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoConnect.Api.Controllers;

[ApiController]
[Route("api/questions/{questionId:int}/[controller]")]
public class AnswersController(AppDbContext db, IConfiguration cfg) : ControllerBase
{
    private string UploadRoot => cfg["ImageStorage:Root"]!;

    // ✅ Create answer
    [Authorize]
    [HttpPost]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult> Create(int questionId, [FromForm] string body, [FromForm] List<IFormFile>? images)
    {
        var exists = await db.Questions.AnyAsync(q => q.Id == questionId);
        if (!exists) return NotFound("Question not found");

        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var a = new Answer { QuestionId = questionId, Body = body, UserId = userId, Status = ApprovalStatus.Pending };
        db.Answers.Add(a);

        if (images is { Count: > 0 })
        {
            Directory.CreateDirectory(UploadRoot);
            foreach (var file in images)
            {
                var filename = $"{Guid.NewGuid()}_{file.FileName}";
                var abs = Path.Combine(UploadRoot, filename);
                await using var fs = System.IO.File.Create(abs);
                await file.CopyToAsync(fs);
                a.Images.Add(new ImageFile { Path = Path.Combine("uploads", filename).Replace("\\", "/") });
            }
        }

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Create), new { questionId, id = a.Id }, new { a.Id, a.Status });
    }

    // ✅ Update answer (only owner can update)
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int questionId, int id, [FromForm] string body)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var a = await db.Answers.FindAsync(id);
        if (a is null || a.QuestionId != questionId) return NotFound();
        if (a.UserId != userId) return Forbid();

        a.Body = body;
        a.Status = ApprovalStatus.Pending; // reset for re-approval
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ✅ Delete answer (only owner can delete)
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int questionId, int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var a = await db.Answers.FindAsync(id);
        if (a is null || a.QuestionId != questionId) return NotFound();
        if (a.UserId != userId) return Forbid();

        db.Answers.Remove(a);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
