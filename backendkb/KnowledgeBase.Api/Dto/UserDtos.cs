using KnowledgeBase.Api.Domain.Enums;

namespace KnowledgeBase.Api.DTOs;

// Request DTO for creating a new user
public class CreateUserRequest
{
    public string EmployeeId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public Role Role { get; set; } // e.g. User, Contributor
}

// Request DTO for updating existing user details
public class UpdateUserRequest
{
    public string EmployeeId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public Role Role { get; set; }
    public bool IsActive { get; set; }
    public string? Password { get; set; } // Optional: update password if provided
}

// Response DTO for returning user summary information
public class UserSummary
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Role { get; set; } = default!; // Return as string (Role enum.ToString())
    public bool IsActive { get; set; }
}
