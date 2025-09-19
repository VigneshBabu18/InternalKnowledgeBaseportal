namespace KnowledgeBase.Api.DTOs;

public class CreateCommentRequest
{
    public int ArticleId { get; set; }
    public string Text { get; set; } = default!;
}

public class CommentResponse
{
    public int Id { get; set; }
    public int ArticleId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = default!;
    public string Text { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
