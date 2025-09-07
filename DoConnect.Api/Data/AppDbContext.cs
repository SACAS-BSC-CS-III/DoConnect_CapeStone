using DoConnect.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DoConnect.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<ImageFile> Images => Set<ImageFile>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        b.Entity<Question>()
            .HasOne(q => q.User)
            .WithMany(u => u.Questions)
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Answer>()
            .HasOne(a => a.User)
            .WithMany(u => u.Answers)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Answer>()
            .HasOne(a => a.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<ImageFile>()
            .HasOne(i => i.Question)
            .WithMany(q => q.Images)
            .HasForeignKey(i => i.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<ImageFile>()
            .HasOne(i => i.Answer)
            .WithMany(a => a.Images)
            .HasForeignKey(i => i.AnswerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
