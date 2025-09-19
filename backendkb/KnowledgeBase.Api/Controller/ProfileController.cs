using System.Security.Claims;
using KnowledgeBase.Api.Auth;
using KnowledgeBase.Api.Data;
using KnowledgeBase.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBase.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize(Policy = "AnyAuthenticated")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _hasher;
    public ProfileController(AppDbContext db, PasswordHasher hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // RUD for user profile (name, password)
    [HttpGet]
    public async Task<ActionResult<UserSummary>> Get()
    {
        // Admin is virtual; skip
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == CurrentUserId);
        if (user == null) return NotFound("Profile not found (admin uses hardcoded login).");

        return Ok(new UserSummary
        {
            Id = user.Id,
            EmployeeId = user.EmployeeId ?? "",
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        });
    }


    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateUserRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == CurrentUserId);
        if (user == null) return NotFound("Profile not found.");

        if (!string.IsNullOrWhiteSpace(req.Name))
            user.Name = req.Name;

        if (!string.IsNullOrWhiteSpace(req.Password))
            user.PasswordHash = _hasher.Hash(req.Password);

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent(); 
    }

    // Simple dashboards for User and Contributor
    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> Dashboard()
    {
        if (User.IsInRole("Contributor"))
        {
            var myId = CurrentUserId;
            var totalMine = await _db.Articles.CountAsync(a => a.AuthorId == myId);
            var pending = await _db.Articles.CountAsync(a => a.AuthorId == myId && a.Status == Domain.Enums.ArticleStatus.Pending);
            var approved = await _db.Articles.CountAsync(a => a.AuthorId == myId && a.Status == Domain.Enums.ArticleStatus.Approved);
            var rejected = await _db.Articles.CountAsync(a => a.AuthorId == myId && a.Status == Domain.Enums.ArticleStatus.Rejected);

            var topMine = await _db.Articles
                .Where(a => a.AuthorId == myId)
                .OrderByDescending(a => a.ViewCount)
                .Take(5)
                .Select(a => new { a.Id, a.Name, a.ViewCount, status = a.Status.ToString() })
                .ToListAsync();

            return Ok(new
            {
                totalArticles = totalMine,
                pending,
                approved,
                rejected,
                topViewedMine = topMine
            });
        }
        else
        {
            // Normal User
            var recent = await _db.Articles
                .Where(a => a.Status == Domain.Enums.ArticleStatus.Approved)
                .OrderByDescending(a => a.ApprovedAt)
                .Take(10)
                .Select(a => new { a.Id, a.Name, a.CategoryId, a.ViewCount })
                .ToListAsync();

            var top = await _db.Articles
                .Where(a => a.Status == Domain.Enums.ArticleStatus.Approved)
                .OrderByDescending(a => a.ViewCount)
                .Take(10)
                .Select(a => new { a.Id, a.Name, a.CategoryId, a.ViewCount })
                .ToListAsync();

            return Ok(new
            {
                recentApproved = recent,
                mostViewed = top
            });
        }
    }
}
