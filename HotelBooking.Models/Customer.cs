using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models
{
    public class Customer
    {
        [Key]
        public int Cust_Id { get; set; }
        [Display(Name = "Full Name")]
        public string? Full_Name { get; set; }
        public string? Nationality { get; set; }
        [Display(Name = "National ID")]
        public string? National_ID { get; set; }
        public string? Email { get; set; }
        public string? ID_Image_URL { get; set; }
        [Display(Name = "Marriage Status")]
        public bool? Marriage_status { get; set; } 
        public string? Mariage_cert_URL { get; set; }
        [Display(Name = "Phone Number")]
        public int Phone_Number { get; set; }
    }
}
