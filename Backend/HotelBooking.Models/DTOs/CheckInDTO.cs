using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models.DTOs
{
    public class CheckInDTO
    {
        public int ReservationId { get; set; }
        public float Paid { get; set; } = 0;
        public float Discount { get; set; } = 0;
    }
}
