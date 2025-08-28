    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    namespace HotelBooking.Models.Models
    {
        public class Rate : BaseEntity
        {
            [Required]
            public required string Type { get; set; }
            public float Price { get; set; } = 0;
        }
    }
