    using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBooking.Models.Models;

public class Reservation
{
    // Primary Key
    [Key]
    public string Id { get; set; }

    // Foreign Keys
    [Required(ErrorMessage = "Customer ID is required.")]
    [ForeignKey("Customer")]
    public string CustomerId { get; set; }

    [ForeignKey("Room")]
    public string RoomId { get; set; }

    // Dates
    [Required(ErrorMessage = "Check-in date is required.")]
    [DataType(DataType.Date)]
    public DateTime CheckInDate { get; set; }

    [Required(ErrorMessage = "Check-out date is required.")]
    [DataType(DataType.Date)]
    public DateTime CheckOutDate { get; set; }


    public int NumberOfAdults { get; set; }

    public int NumberOfChildren { get; set; }

    public int NumberOfExtraBeds { get; set; }
}
