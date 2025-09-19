using System.Security.Claims;
using KnowledgeBase.Api.Data;
using KnowledgeBase.Api.Domain.Entities;
using KnowledgeBase.Api.Domain.Enums;
using KnowledgeBase.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBase.Api.Controllers;

[ApiController]
[Route("api/articles")]
public class ArticlesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ArticlesController(AppDbContext db) => _db = db;

    int? CurrentUserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
    bool IsAdmin => User.IsInRole("Admin");
    bool IsContributor => User.IsInRole("Contributor");
    bool IsUserRole => User.IsInRole("User");

    // Contributor: add article (goes Pending)
    [HttpPost]
    [Authorize(Policy = "ContributorOnly")]
    public async Task<ActionResult<ArticleResponse>> Create([FromBody] CreateArticleRequest req)
    {
        var authorId = CurrentUserId!.Value;
        var exists = await _db.Categories.AnyAsync(c => c.Id == req.CategoryId);
        if (!exists) return BadRequest("Invalid category.");

        var a = new Article
        {
            Name = req.Name,
            Description = req.Description,
            Content = req.Content,
            CategoryId = req.CategoryId,
            AuthorId = authorId,
            Status = ArticleStatus.Pending,
            DriveLink = req.DriveLink
        };
        _db.Articles.Add(a);
        await _db.SaveChangesAsync();

        var category = await _db.Categories.FindAsync(a.CategoryId);
        var author = await _db.Users.FindAsync(authorId);

        return Ok(new ArticleResponse
        {
            Id = a.Id,
            Name = a.Name,
            Description = a.Description,
            Content = a.Content,
            CategoryId = a.CategoryId,
            CategoryName = category!.Name,
            AuthorId = authorId,
            AuthorName = author!.Name,
            Status = a.Status.ToString(),
            RejectReason = a.RejectReason,
            ApprovedAt = a.ApprovedAt,
            ViewCount = a.ViewCount,
            DriveLink = a.DriveLink,
            CreatedAt = a.CreatedAt
        });
    }

    // Contributor: update own pending/rejected (or approved becomes pending) article
    [HttpPut("{id:int}")]
    [Authorize(Policy = "ContributorOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateArticleRequest req)
    {
        var authorId = CurrentUserId!.Value;
        var a = await _db.Articles.FirstOrDefaultAsync(x => x.Id == id && x.AuthorId == authorId);
        if (a == null) return NotFound();

        if (req.CategoryId.HasValue && !await _db.Categories.AnyAsync(c => c.Id == req.CategoryId.Value))
            return BadRequest("Invalid category.");

        if (req.Name != null) a.Name = req.Name;
        if (req.Description != null) a.Description = req.Description;
        if (req.Content != null) a.Content = req.Content;
        if (req.CategoryId.HasValue) a.CategoryId = req.CategoryId.Value;
        if (req.DriveLink != null) a.DriveLink = req.DriveLink;

        // Editing an approved article resubmits for approval
        if (a.Status == ArticleStatus.Approved)
        {
            a.Status = ArticleStatus.Pending;
            a.ApprovedAt = null;
            a.RejectReason = null;
        }
        else if (a.Status == ArticleStatus.Rejected)
        {
            a.Status = ArticleStatus.Pending;
            a.RejectReason = null;
        }

        a.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Contributor: delete own article
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "ContributorOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var authorId = CurrentUserId!.Value;
        var a = await _db.Articles.FirstOrDefaultAsync(x => x.Id == id && x.AuthorId == authorId);
        if (a == null) return NotFound();
        _db.Articles.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Contributor: list own articles + status + views
    [HttpGet("mine")]
    [Authorize(Policy = "ContributorOnly")]
    public async Task<ActionResult<IEnumerable<ArticleResponse>>> Mine()
    {
        var authorId = CurrentUserId!.Value;
        var list = await _db.Articles
            .Include(a => a.Category)
            .Where(a => a.AuthorId == authorId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ArticleResponse
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                Content = a.Content,
                CategoryId = a.CategoryId,
                CategoryName = a.Category.Name,
                AuthorId = a.AuthorId,
                AuthorName = User.Identity!.Name ?? "Me",
                Status = a.Status.ToString(),
                RejectReason = a.RejectReason,
                ApprovedAt = a.ApprovedAt,
                ViewCount = a.ViewCount,
                DriveLink = a.DriveLink,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    // User/Contributor: view approved articles (recent, most viewed, search)
    [HttpGet]
    [Authorize(Policy = "AnyAuthenticated")]
    public async Task<ActionResult<IEnumerable<ArticleResponse>>> Browse(
        [FromQuery] string? q,
        [FromQuery] int? categoryId,
        [FromQuery] string sort = "recent", // "recent" or "views"
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Articles
            .Include(a => a.Category)
            .Include(a => a.Author)
            .Where(a => a.Status == ArticleStatus.Approved)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(a => a.Name.Contains(q) || a.Description.Contains(q));

        if (categoryId.HasValue)
            query = query.Where(a => a.CategoryId == categoryId.Value);

        query = sort == "views"
            ? query.OrderByDescending(a => a.ViewCount).ThenByDescending(a => a.ApprovedAt)
            : query.OrderByDescending(a => a.ApprovedAt).ThenByDescending(a => a.CreatedAt);

        var skip = (page - 1) * pageSize;
        var list = await query.Skip(skip).Take(pageSize).Select(a => new ArticleResponse
        {
            Id = a.Id,
            Name = a.Name,
            Description = a.Description,
            Content = a.Content,
            CategoryId = a.CategoryId,
            CategoryName = a.Category.Name,
            AuthorId = a.AuthorId,
            AuthorName = a.Author.Name,
            Status = a.Status.ToString(),
            RejectReason = a.RejectReason,
            ApprovedAt = a.ApprovedAt,
            ViewCount = a.ViewCount,
            DriveLink = a.DriveLink,
            CreatedAt = a.CreatedAt
        }).ToListAsync();

        return Ok(list);
    }

    // User/Contributor: get article details (approved only unless author or admin)
    [HttpGet("{id:int}")]
    [Authorize(Policy = "AnyAuthenticated")]
    public async Task<ActionResult<ArticleResponse>> Get(int id)
    {
        var a = await _db.Articles
            .Include(x => x.Category)
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return NotFound();

        if (a.Status != ArticleStatus.Approved && !IsAdmin && a.AuthorId != CurrentUserId)
            return Forbid();

        return Ok(new ArticleResponse
        {
            Id = a.Id,
            Name = a.Name,
            Description = a.Description,
            Content = a.Content,
            CategoryId = a.CategoryId,
            CategoryName = a.Category.Name,
            AuthorId = a.AuthorId,
            AuthorName = a.Author.Name,
            Status = a.Status.ToString(),
            RejectReason = a.RejectReason,
            ApprovedAt = a.ApprovedAt,
            ViewCount = a.ViewCount,
            DriveLink = a.DriveLink,
            CreatedAt = a.CreatedAt
        });
    }

    // User/Contributor: record a view (increments priority)
    [HttpPost("{id:int}/view")]
    [Authorize(Policy = "AnyAuthenticated")]
    public async Task<IActionResult> RecordView(int id)
    {
        var a = await _db.Articles.FindAsync(id);
        if (a == null) return NotFound();
        if (a.Status != ArticleStatus.Approved && !IsAdmin && a.AuthorId != CurrentUserId)
            return Forbid();

        _db.ArticleViews.Add(new ArticleView
        {
            ArticleId = id,
            UserId = CurrentUserId
        });
        a.ViewCount += 1;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin: Approve article
    [HttpPost("{id:int}/approve")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Approve(int id)
    {
        var a = await _db.Articles.FindAsync(id);
        if (a == null) return NotFound();

        a.Status = ArticleStatus.Approved;
        a.ApprovedAt = DateTime.UtcNow;
        a.RejectReason = null;
        a.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin: Reject article with reason
    [HttpPost("{id:int}/reject")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectArticleRequest req)
    {
        var a = await _db.Articles.FindAsync(id);
        if (a == null) return NotFound();

        if (string.IsNullOrWhiteSpace(req.Reason))
            return BadRequest("Rejection reason is required.");

        a.Status = ArticleStatus.Rejected;
        a.RejectReason = req.Reason;
        a.ApprovedAt = null;
        a.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin: Get all pending articles for approval
    [HttpGet("pending")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<ArticleResponse>>> GetPendingArticles()
    {
        var list = await _db.Articles
            .Include(a => a.Category)
            .Include(a => a.Author)
            .Where(a => a.Status == ArticleStatus.Pending)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ArticleResponse
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                Content = a.Content,
                CategoryId = a.CategoryId,
                CategoryName = a.Category.Name,
                AuthorId = a.AuthorId,
                AuthorName = a.Author.Name,
                Status = a.Status.ToString(),
                RejectReason = a.RejectReason,
                ApprovedAt = a.ApprovedAt,
                ViewCount = a.ViewCount,
                DriveLink = a.DriveLink,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }
    

}
    

// DTO for rejection reason
public class RejectArticleRequest
{
    public string Reason { get; set; } = default!;
}
