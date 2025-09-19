using KnowledgeBase.Api.Domain.Enums;

namespace KnowledgeBase.Api.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string? EmployeeId { get; set; } // Admin will set when creating
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public Role Role { get; set; } = Role.User;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<Article> Articles { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
}
