using HotelBooking.Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models.Auth
{
    public abstract class BaseUser : BaseEntity
    {

        public string UserName { get; set; } = default!;

        public string Email { get; set; } = default!;

        public string PasswordHash { get; set; } = default!;

        public string Role { get; set; }

        public float DiscountLimit { get; set; } = 0;
    }

}
