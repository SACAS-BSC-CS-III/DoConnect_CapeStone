using DoConnect.Api.Data;
using DoConnect.Api.Dtos;
using DoConnect.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController(AppDbContext db, IConfiguration cfg) : ControllerBase
{
    private string UploadRoot => cfg["ImageStorage:Root"]!;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuestionListItemDto>>> Get([FromQuery] string? q)
    {
        var query = db.Questions
            .Include(x => x.User)
            .Where(x => x.Status == ApprovalStatus.Approved);

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(x => x.Title.Contains(q) || x.Body.Contains(q));

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new QuestionListItemDto(x.Id, x.Title, x.User!.Username, x.Status.ToString(), x.CreatedAt))
            .ToListAsync();

        return items;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuestionDetailDto>> GetById(int id)
    {
        var q = await db.Questions
            .Include(x => x.User)
            .Include(x => x.Images)
            .Include(x => x.Answers).ThenInclude(a => a.User)
            .Include(x => x.Answers).ThenInclude(a => a.Images)
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == ApprovalStatus.Approved);

        if (q is null) return NotFound();

        var dto = new QuestionDetailDto(
            q.Id, q.Title, q.Body, q.User!.Username, q.Status.ToString(), q.CreatedAt,
            q.Images.Select(i => "/" + i.Path),
            q.Answers.Where(a => a.Status == ApprovalStatus.Approved)
                     .OrderByDescending(a => a.CreatedAt)
                     .Select(a => new AnswerItemDto(
                         a.Id, a.Body, a.User!.Username, a.Status.ToString(), a.CreatedAt,
                         a.Images.Select(i => "/" + i.Path)))
        );
        return dto;
    }

    [Authorize]
    [HttpPost]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult> Create([FromForm] string title, [FromForm] string body, [FromForm] List<IFormFile>? images)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var q = new Question { Title = title, Body = body, UserId = userId, Status = ApprovalStatus.Pending };
        db.Questions.Add(q);

        if (images is { Count: > 0 })
        {
            Directory.CreateDirectory(UploadRoot);
            foreach (var file in images)
            {
                var filename = $"{Guid.NewGuid()}_{file.FileName}";
                var rel = Path.Combine("uploads", filename).Replace("\\", "/");
                var abs = Path.Combine(UploadRoot, filename);
                await using var fs = System.IO.File.Create(abs);
                await file.CopyToAsync(fs);
                q.Images.Add(new ImageFile { Path = Path.Combine("uploads", filename).Replace("\\", "/") });
            }
        }

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = q.Id }, new { q.Id, q.Status });
    }
}
