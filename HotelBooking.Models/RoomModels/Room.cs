using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Models.RoomModels;

public class Room
{
    [Key]
    public int Id { get; set; }

    [Required]
    public required string RoomNumber { get; set; }
    public int Floor { get; set; }
    public int Capacity { get; protected set; }

    public bool IsAvailable { get; set; }

}
