using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBooking.Models.RoomModels;

public class Room
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public required string RoomNumber { get; set; }
    public int Floor { get; set; }
    public int Capacity { get; set; }

    public string RoomType { get; set; }
    public bool IsAvailable { get; set; }

}
