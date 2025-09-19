using System.Security.Claims;
using KnowledgeBase.Api.Data;
using KnowledgeBase.Api.Domain.Enums;
using KnowledgeBase.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBase.Api.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize(Policy = "AnyAuthenticated")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CommentsController(AppDbContext db) => _db = db;

    int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> Create([FromBody] CreateCommentRequest req)
    {
        var article = await _db.Articles.FirstOrDefaultAsync(a => a.Id == req.ArticleId);
        if (article == null) return NotFound("Article not found.");
        if (article.Status != ArticleStatus.Approved)
            return BadRequest("Cannot comment on non-approved article.");

        var user = await _db.Users.FindAsync(CurrentUserId);
        var c = new Domain.Entities.Comment
        {
            ArticleId = req.ArticleId,
            UserId = CurrentUserId,
            Text = req.Text
        };
        _db.Comments.Add(c);
        await _db.SaveChangesAsync();

        return Ok(new CommentResponse
        {
            Id = c.Id,
            ArticleId = c.ArticleId,
            UserId = c.UserId,
            UserName = user?.Name ?? "User",
            Text = c.Text,
            CreatedAt = c.CreatedAt
        });
    }

    // List comments for an article
    [HttpGet("article/{articleId:int}")]
    public async Task<ActionResult<IEnumerable<CommentResponse>>> ForArticle(int articleId)
    {
        var articleExists = await _db.Articles.AnyAsync(a => a.Id == articleId);
        if (!articleExists) return NotFound("Article not found.");

        var list = await _db.Comments
            .Include(c => c.User)
            .Where(c => c.ArticleId == articleId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentResponse
            {
                Id = c.Id,
                ArticleId = c.ArticleId,
                UserId = c.UserId,
                UserName = c.User.Name,
                Text = c.Text,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }
}
