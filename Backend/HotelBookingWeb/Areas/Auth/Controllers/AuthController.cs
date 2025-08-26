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
        _config = config;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        // check username
        var usernameTaken =
            _unitOfWork.Users.Get(u => u.UserName == dto.UserName) != null ||
            _unitOfWork.Admins.Get(a => a.UserName == dto.UserName) != null;

        if (usernameTaken)
            return BadRequest("Username is already taken.");

        // check email
        var emailTaken =
            _unitOfWork.Users.Get(u => u.Email == dto.Email) != null ||
            _unitOfWork.Admins.Get(a => a.Email == dto.Email) != null;

        if (emailTaken)
            return BadRequest("Email is already taken.");

        var user = new User
        {
            UserName = dto.UserName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = PasswordHasher.Hash(dto.Password),
            Role = "User",
            createdBy = "Self"
        };

        _unitOfWork.Users.Create(user);
        _unitOfWork.Save();

        return Ok("User registered successfully.");
    }
    [HttpPost("register-admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult RegisterAdmin(RegisterDto dto)
    {
        // check username
        var usernameTaken =
            _unitOfWork.Admins.Get(a => a.UserName == dto.UserName) != null ||
            _unitOfWork.Users.Get(u => u.UserName == dto.UserName) != null;

        if (usernameTaken)
            return BadRequest("Username is already taken.");

        // check email
        var emailTaken =
            _unitOfWork.Admins.Get(a => a.Email == dto.Email) != null ||
            _unitOfWork.Users.Get(u => u.Email == dto.Email) != null;

        if (emailTaken)
            return BadRequest("Email is already taken.");
        string currentAdminUserName = User.Identity?.Name;
        // create admin
        var admin = new HotelBooking.Models.Auth.Admin
        {
            UserName = dto.UserName,
            Email = dto.Email,
            PasswordHash = PasswordHasher.Hash(dto.Password),
            Role = "Admin",
            createdBy = currentAdminUserName
        };

        _unitOfWork.Admins.Create(admin);
        _unitOfWork.Save();

        return Ok("Admin registered successfully.");
    }
    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login(LoginDto dto)
    {
        var try1 = _unitOfWork.Users.Get(u => u.UserName == dto.UserName);
        HotelBooking.Models.Auth.Admin try2 = null;

        var user = null as BaseUser;

        if (try1 == null)
        {
            try2 = _unitOfWork.Admins.Get(u => u.UserName == dto.UserName);
            if (try2 == null)
            {
                return Unauthorized("Invalid username or email.");
            }
            else
            {
                user = try2 as HotelBooking.Models.Auth.Admin;
            }
        }
        else
        {
            user = try1 as User;
        }

        if (user == null || !PasswordHasher.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid password.");

        var claims = new List<Claim>
    {
        new Claim("id", user.Id.ToString()),
        new Claim("username", user.UserName),
        new Claim("email", user.Email),
        new Claim("role", user.Role)
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

}