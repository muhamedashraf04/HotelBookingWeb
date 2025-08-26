using HotelBooking.Models.Models;
using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Models.RoomModels;

public class Room : BaseEntity
{
    [Required]
    public required string RoomNumber { get; set; }
    public string Images { get; set; } = "";
    public int Floor { get; set; }
    public int Capacity { get; set; }
    [Required]
    public required string RoomType { get; set; }
    public bool IsAvailable { get; set; }

    public float Price { get; set; } 

    public void SetPrice(float x)
    {
        Price = x;
    }
}
