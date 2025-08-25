using HotelBooking.Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models.Auth
{
    public class User : BaseUser
    {
        public string? PhoneNumber { get; set; }
    }

}
