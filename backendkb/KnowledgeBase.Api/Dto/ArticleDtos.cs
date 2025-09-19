public class CreateArticleRequest
{
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string? Content { get; set; }
    public int CategoryId { get; set; }
    public string? DriveLink { get; set; }  // New property
}

public class UpdateArticleRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }
    public int? CategoryId { get; set; }
    public string? DriveLink { get; set; }  // New property
}

public class ArticleResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string? Content { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = default!;
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string? RejectReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public long ViewCount { get; set; }
    public string? DriveLink { get; set; } // New property
    public DateTime CreatedAt { get; set; }
}
