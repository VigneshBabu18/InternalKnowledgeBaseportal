namespace KnowledgeBase.Api.Domain.Entities;

public class ArticleView
{
    public long Id { get; set; }
    public int ArticleId { get; set; }
    public Article Article { get; set; } = default!;
    public int? UserId { get; set; } // optional for anonymous (if you allow later)
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
}
