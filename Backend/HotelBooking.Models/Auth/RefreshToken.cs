using HotelBooking.Models.Models;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

public sealed class RefreshToken : BaseEntity
{
    [Key] public int Id { get; set; }
    [Required] public string UserId { get; set; } = default!;
    [Required] public string TokenHash { get; set; } = default!;
    [Required] public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;

    public static string Hash(string input)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(input)));
    }
}
