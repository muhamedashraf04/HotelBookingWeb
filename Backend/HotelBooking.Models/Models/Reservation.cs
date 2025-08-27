    using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelBooking.Models.Models;

public class Reservation : BaseEntity
{
    // Foreign Keys
    [Required(ErrorMessage = "Customer ID is required.")]
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }

    [ForeignKey("Room")]
    public int RoomId { get; set; }

    public string RoomType { get; set; }

    // Dates
    [Required(ErrorMessage = "Check-in date is required.")]
    [DataType(DataType.Date)]
    public DateTime CheckInDate { get; set; }

    [Required(ErrorMessage = "Check-out date is required.")]
    [DataType(DataType.Date)]
    public DateTime CheckOutDate { get; set; }

    public float Paid { get; set; } = 0;
    public float Dues {  get; set; } = 0;

    public string ProofOfPayment { get; set; } = "";

    public string Status { get; set; } = "Reserved";

    public float Discount { get; set; } = 0;

    public int NumberOfAdults { get; set; }

    public int NumberOfChildren { get; set; }

    public int NumberOfExtraBeds { get; set; }
}
