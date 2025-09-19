namespace KnowledgeBase.Api.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }

    public List<Article> Articles { get; set; } = new();
}
