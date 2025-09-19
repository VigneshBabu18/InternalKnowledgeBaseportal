using KnowledgeBase.Api.Domain.Entities;
using KnowledgeBase.Api.Domain.Enums;

public class Article
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string? Content { get; set; } // optional long text
    public int CategoryId { get; set; }
    public Category Category { get; set; } = default!;
    public int AuthorId { get; set; }
    public User Author { get; set; } = default!;
    public ArticleStatus Status { get; set; } = ArticleStatus.Pending;
    public string? RejectReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public long ViewCount { get; set; } = 0; // denormalized counter
    public string? DriveLink { get; set; }  // New drive link added
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<Comment> Comments { get; set; } = new();
    public List<ArticleView> Views { get; set; } = new();
}
