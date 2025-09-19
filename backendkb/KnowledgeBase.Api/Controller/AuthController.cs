using System;
using System.Threading.Tasks;
using KnowledgeBase.Api.Auth;
using KnowledgeBase.Api.Data;
using KnowledgeBase.Api.Domain.Entities;
using KnowledgeBase.Api.Domain.Enums;
using KnowledgeBase.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace KnowledgeBase.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtTokenService _jwt;
        private readonly PasswordHasher _hasher;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, JwtTokenService jwt, PasswordHasher hasher, IConfiguration config)
        {
            _db = db;
            _jwt = jwt;
            _hasher = hasher;
            _config = config;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                    return BadRequest(new { message = "Email and password are required" });

                // Hardcoded admin credentials from config (consider storing password hash securely)
                var adminEmail = _config["AdminCredentials:Email"];
                var adminPass = _config["AdminCredentials:Password"];
                if (req.Email.Equals(adminEmail, StringComparison.OrdinalIgnoreCase) && req.Password == adminPass)
                {
                    var admin = new User
                    {
                        Id = 0, // virtual user
                        Name = "Administrator",
                        Email = adminEmail!,
                        Role = Role.Admin
                    };
                    var token = _jwt.Create(admin);
                    return Ok(new LoginResponse
                    {
                        Token = token,
                        Role = Role.Admin.ToString(),
                        UserId = null,
                        Name = admin.Name,
                        Email = admin.Email
                    });
                }

                // Find user in database
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);
                if (user == null)
                    return Unauthorized(new { message = "Invalid email or password" });

                // Verify password hash
                if (!_hasher.Verify(req.Password, user.PasswordHash))
                    return Unauthorized(new { message = "Invalid email or password" });

                // Create JWT token
                var jwt = _jwt.Create(user);
                return Ok(new LoginResponse
                {
                    Token = jwt,
                    Role = user.Role.ToString(),
                    UserId = user.Id,
                    Name = user.Name,
                    Email = user.Email
                });
            }
            catch (Exception ex)
            {
                // Consider logging the exception here
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        // Admin creates users
        [HttpPost("admin/create-user")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<UserSummary>> CreateUser([FromBody] CreateUserRequest req)
        {
            try
            {
                // Input validation
                if (string.IsNullOrWhiteSpace(req.Email) ||
                    string.IsNullOrWhiteSpace(req.Password) ||
                    string.IsNullOrWhiteSpace(req.Name))
                {
                    return BadRequest(new { message = "Name, email, and password are required" });
                }

                if (req.Role == Role.Admin)
                    return BadRequest(new { message = "Cannot create admin via API." });

                if (await _db.Users.AnyAsync(x => x.Email == req.Email))
                    return Conflict(new { message = "Email already exists." });

                var user = new User
                {
                    EmployeeId = req.EmployeeId,
                    Name = req.Name,
                    Email = req.Email,
                    PasswordHash = _hasher.Hash(req.Password),
                    Role = req.Role,
                    IsActive = true
                };

                _db.Users.Add(user);
                await _db.SaveChangesAsync();

                return Ok(new UserSummary
                {
                    Id = user.Id,
                    EmployeeId = user.EmployeeId!,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    IsActive = user.IsActive
                });
            }
            catch (Exception ex)
            {
                // Consider logging the exception here
                return StatusCode(500, new { message = "An error occurred while creating the user" });
            }
        }
    }
}
