using KnowledgeBase.Api.Auth;
using KnowledgeBase.Api.Data;
using KnowledgeBase.Api.Domain.Entities;
using KnowledgeBase.Api.Domain.Enums;
using KnowledgeBase.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBase.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db) => _db = db;

    // Categories CRUD (existing, unchanged)
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("categories")]
    public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CategoryRequest req)
    {
        if (await _db.Categories.AnyAsync(c => c.Slug == req.Slug))
            return Conflict("Slug already exists.");

        var c = new Category { Name = req.Name, Slug = req.Slug, Description = req.Description };
        _db.Categories.Add(c);
        await _db.SaveChangesAsync();

        return Ok(new CategoryResponse { Id = c.Id, Name = c.Name, Slug = c.Slug, Description = c.Description });
    }
    [AllowAnonymous]
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryResponse>>> ListCategories()
    {
        var list = await _db.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse { Id = c.Id, Name = c.Name, Slug = c.Slug, Description = c.Description })
            .ToListAsync();
        return Ok(list);
    }
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("categories/{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryRequest req)
    {
        var c = await _db.Categories.FindAsync(id);
        if (c == null) return NotFound();

        if (c.Slug != req.Slug && await _db.Categories.AnyAsync(x => x.Slug == req.Slug))
            return Conflict("Slug already exists.");

        c.Name = req.Name;
        c.Slug = req.Slug;
        c.Description = req.Description;
        await _db.SaveChangesAsync();
        return NoContent();
    } 
     [Authorize(Policy = "AdminOnly")]
    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var c = await _db.Categories.FindAsync(id);
        if (c == null) return NotFound();
        _db.Categories.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Approvals (existing)
     [Authorize(Policy = "AdminOnly")]
    [HttpPost("articles/{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var a = await _db.Articles.FindAsync(id);
        if (a == null) return NotFound();
        a.Status = ArticleStatus.Approved;
        a.RejectReason = null;
        a.ApprovedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
     [Authorize(Policy = "AdminOnly")]
    [HttpPost("articles/{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] string reason)
    {
        var a = await _db.Articles.FindAsync(id);
        if (a == null) return NotFound();
        a.Status = ArticleStatus.Rejected;
        a.RejectReason = reason;
        a.ApprovedAt = null;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Search (existing)
   
    [HttpGet("search")]
public async Task<ActionResult<IEnumerable<ArticleResponse>>> Search([FromQuery] string? q, [FromQuery] int? categoryId)
{
    var query = _db.Articles
        .Include(a => a.Category)
        .Include(a => a.Author)
        .Where(a => a.Status == ArticleStatus.Approved) // FILTER ONLY APPROVED
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(q))
        query = query.Where(a => a.Name.Contains(q) || a.Description.Contains(q));

    if (categoryId.HasValue)
        query = query.Where(a => a.CategoryId == categoryId.Value);

    var result = await query
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
            CreatedAt = a.CreatedAt,
        })
        .ToListAsync();

    return Ok(result);
}


    // Dashboard (existing)

    [HttpGet("dashboard")]
    public async Task<ActionResult<object>> Dashboard()
    {
        var totalUsers = await _db.Users.CountAsync();
        var contributors = await _db.Users.CountAsync(u => u.Role == Role.Contributor);
        var pending = await _db.Articles.CountAsync(a => a.Status == ArticleStatus.Pending);
        var approved = await _db.Articles.CountAsync(a => a.Status == ArticleStatus.Approved);
        var topViewed = await _db.Articles.Where(a => a.Status == ArticleStatus.Approved)
            .OrderByDescending(a => a.ViewCount)
            .Take(10)
            .Select(a => new { a.Id, a.Name, a.ViewCount })
            .ToListAsync();

        return Ok(new
        {
            totalUsers,
            contributors,
            pendingApprovals = pending,
            approvedDocuments = approved,
            topViewed
        });
    }

    // --- Begin User Management ---
   [Authorize(Policy = "AdminOnly")]
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserSummary>>> GetUsers()
    {
        var users = await _db.Users
            .OrderBy(u => u.Name)
            .Select(u => new UserSummary
            {
                Id = u.Id,
                EmployeeId = u.EmployeeId,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive
            })
            .ToListAsync();

        return Ok(users);
    }
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("users/{id:int}")]
    public async Task<ActionResult<UserSummary>> GetUser(int id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();

        return Ok(new UserSummary
        {
            Id = u.Id,
            EmployeeId = u.EmployeeId,
            Name = u.Name,
            Email = u.Email,
            Role = u.Role.ToString(),
            IsActive = u.IsActive
        });
    }
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("users")]
    public async Task<ActionResult<UserSummary>> CreateUser([FromBody] CreateUserRequest req)
    {
        if (req.Role == Role.Admin) return BadRequest("Cannot create admin via API.");
        if (await _db.Users.AnyAsync(x => x.Email == req.Email))
            return Conflict("Email already exists.");

        var user = new User
        {
            EmployeeId = req.EmployeeId,
            Name = req.Name,
            Email = req.Email,
            PasswordHash = new PasswordHasher().Hash(req.Password),
            Role = req.Role,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new UserSummary
        {
            Id = user.Id,
            EmployeeId = user.EmployeeId,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            IsActive = user.IsActive
        });
    }
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Prevent admin role updates via API if needed
        if (req.Role == Role.Admin)
            return BadRequest("Cannot assign admin role via API.");

        if (user.Email != req.Email && await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict("Email already exists.");

        user.EmployeeId = req.EmployeeId;
        user.Name = req.Name;
        user.Email = req.Email;
        user.Role = req.Role;
        // Optionally update password if supplied
        if (!string.IsNullOrWhiteSpace(req.Password))
        {
            user.PasswordHash = new PasswordHasher().Hash(req.Password);
        }
        user.IsActive = req.IsActive;
        await _db.SaveChangesAsync();

        return NoContent();
    }
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
