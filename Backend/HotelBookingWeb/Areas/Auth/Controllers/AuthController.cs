using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Auth;
using HotelBooking.Models.DTOs.HotelBooking.Contracts.Auth;
using HotelBooking.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelBookingWeb.Areas.Auth.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public AuthController(IUnitOfWork unitOfWork, IConfiguration config)
    {
        _config = config;
        _unitOfWork = unitOfWork;
    }

    // ---------------- REGISTER USER (Admins only) ----------------
    [HttpPost("register-user")]
    [Authorize(Roles = "Admin")]
    public IActionResult RegisterUser(RegisterDto dto)
    {
        var usernameTaken = _unitOfWork.Users.Get(u => u.UserName == dto.UserName) != null;
        if (usernameTaken)
            return BadRequest("Username is already taken.");

        var emailTaken = _unitOfWork.Users.Get(u => u.Email == dto.Email) != null;
        if (emailTaken)
            return BadRequest("Email is already taken.");

        string createdBy = User.Identity?.Name ?? "System";

        var user = new User
        {
            UserName = dto.UserName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            DiscountLimit = dto.discountLimit,
            PasswordHash = PasswordHasher.Hash(dto.Password),
            Role = "Receptionist",
            createdBy = createdBy
        };

        _unitOfWork.Users.Create(user);
        _unitOfWork.Save();

        return Ok("User registered successfully.");
    }

    // ---------------- REGISTER ADMIN (Admins only) ----------------
    [HttpPost("register-admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult RegisterAdmin(RegisterDto dto)
    {
        var usernameTaken = _unitOfWork.Users.Get(u => u.UserName == dto.UserName) != null;
        if (usernameTaken)
            return BadRequest("Username is already taken.");

        var emailTaken = _unitOfWork.Users.Get(u => u.Email == dto.Email) != null;
        if (emailTaken)
            return BadRequest("Email is already taken.");

        string createdBy = User.Identity?.Name ?? "System";

        var admin = new User
        {
            UserName = dto.UserName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = PasswordHasher.Hash(dto.Password),
            DiscountLimit = dto.discountLimit,
            Role = "Admin",
            createdBy = createdBy
        };

        _unitOfWork.Users.Create(admin);
        _unitOfWork.Save();

        return Ok("Admin registered successfully.");
    }

    // ---------------- LOGIN ----------------
    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login(LoginDto dto)
    {
        try
        {
            var user = _unitOfWork.Users.Get(u => u.UserName == dto.UserName);

            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            if (!PasswordHasher.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid username or password.");
            }

            var claims = new List<Claim>
            {
                new Claim("id", user.Id.ToString()),
                new Claim(("role"),user.Role),
                new Claim("username", user.UserName),
                new Claim("email", user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:AccessTokenMinutes"]!)),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = jwt });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    // ---------------- DISCOUNT LIMIT ----------------
    [HttpGet("getdiscountlimit")]
    [Authorize]
    public IActionResult GetDiscountLimit()
    {
        var userIdClaim = User.FindFirst("id");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return BadRequest("User ID claim not found or is invalid.");

        var user = _unitOfWork.Users.Get(u => u.Id == userId);
        if (user == null)
            return NotFound("User not found.");

        return Ok(new { limit = user.DiscountLimit });
    }

    // ---------------- GET CURRENT USER INFO ----------------
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userIdClaim = User.FindFirst("id");
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return BadRequest("User ID claim not found or is invalid.");

        var user = _unitOfWork.Users.Get(u => u.Id == userId);
        if (user == null)
            return NotFound("User not found.");

        return Ok(new
        {
            id = user.Id,
            userName = user.UserName,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            role = user.Role,
            discountLimit = user.DiscountLimit
        });
    }

    // ---------------- LIST USERS / ADMINS ----------------
    [HttpGet("getalladmins")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllAdmins()
    {
        var admins = _unitOfWork.Users.GetAll().Where(u => u.Role == "Admin").ToList();
        return Ok(admins);
    }

    [HttpGet("getallusers")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllUsers()
    {
        var users = _unitOfWork.Users.GetAll().Where(u => u.Role == "Receptionist").ToList();
        return Ok(users);
    }

    // ---------------- UPDATE / DELETE ----------------
    [HttpPut("update-user/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult UpdateUser(int id, RegisterDto dto)
    {
        var user = _unitOfWork.Users.Get(u => u.Id == id);
        if (user == null) return NotFound("User not found.");


        user.UserName = dto.UserName;
        user.Email = dto.Email;
        user.DiscountLimit = dto.discountLimit;

        user.PhoneNumber = dto.PhoneNumber;
        user.DiscountLimit = dto.discountLimit;
        if (!string.IsNullOrEmpty(dto.Password))
            user.PasswordHash = PasswordHasher.Hash(dto.Password);

        _unitOfWork.Users.Edit(user);
        _unitOfWork.Save();
        return Ok("User updated successfully.");
    }

    [HttpDelete("delete-user/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteUser(int id)
    {
        var user = _unitOfWork.Users.Get(u => u.Id == id);
        if (user == null) return NotFound("User not found.");

        _unitOfWork.Users.Remove(id);
        _unitOfWork.Save();
        return Ok("User deleted successfully.");
    }

    // ---------------- ADMIN MANAGEMENT ----------------
    [HttpPut("update-admin/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult UpdateAdmin(int id, RegisterDto dto)
    {
        var admin = _unitOfWork.Users.Get(u => u.Id == id);
        if (admin == null) return NotFound("Admin not found.");
        if (admin.Role != "Admin") return BadRequest("User is not an admin.");

        admin.UserName = dto.UserName;
        admin.Email = dto.Email;
        admin.PhoneNumber = dto.PhoneNumber;
        admin.DiscountLimit = dto.discountLimit;
        if (!string.IsNullOrEmpty(dto.Password))
        {
            admin.PasswordHash = PasswordHasher.Hash(dto.Password);

            _unitOfWork.Users.Edit(admin);
            _unitOfWork.Save();
            return Ok("Admin updated successfully.");
        }
        return Ok("No changes made to admin."); // man3rfsh kan feh eh "bad or ok" ya ga7sh 
    }
    [HttpDelete("delete-admin/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteAdmin(int id)
    {
        var admin = _unitOfWork.Users.Get(u => u.Id == id);
        if (admin == null) return NotFound("Admin not found.");
        if (admin.Role != "Admin") return BadRequest("User is not an admin.");

        _unitOfWork.Users.Remove(id);
        _unitOfWork.Save();
        return Ok("Admin deleted successfully.");
    }
}