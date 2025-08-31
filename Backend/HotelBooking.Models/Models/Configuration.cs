using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models.Models
{
    public class Configuration : BaseEntity
    {
        
        [Url]
        public string? IconUrl { get; set; }
    }
}
