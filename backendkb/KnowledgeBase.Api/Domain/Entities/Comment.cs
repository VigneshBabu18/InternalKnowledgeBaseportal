namespace KnowledgeBase.Api.Domain.Entities;

public class Comment
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public Article Article { get; set; } = default!;
    public int UserId { get; set; }
    public User User { get; set; } = default!;
    public string Text { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
