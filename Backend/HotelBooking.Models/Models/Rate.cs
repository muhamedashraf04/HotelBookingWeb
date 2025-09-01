using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Models.Models;

public class Rate : BaseEntity
{
    [Required]
    public required string Type { get; set; }
    public float Price { get; set; } = 0;
    public string badgeBg { get; set; } = "";

    public string badgeText { get; set; } = "";
}

