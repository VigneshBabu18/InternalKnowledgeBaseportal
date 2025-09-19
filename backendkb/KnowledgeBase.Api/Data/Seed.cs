using KnowledgeBase.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBase.Api.Data;

public static class Seed
{
    public static async Task RunAsync(AppDbContext db)
    {
        if (!await db.Categories.AnyAsync())
        {
            db.Categories.AddRange(
                new Category { Name = "HR", Slug = "hr", Description = "Human Resources" },
                new Category { Name = "IT", Slug = "it", Description = "Information Technology" },
                new Category { Name = "Development", Slug = "dev", Description = "Development and Engineering" }
            );
        }

        await db.SaveChangesAsync();
    }
}
