using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models.DTOs
{
    public class ReservationSearchDTO
    {
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string RoomType { get; set; }
    }
}
