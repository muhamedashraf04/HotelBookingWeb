using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.Models.DTOs
{
    public class RegisterCustomerDTO
    {
        public Customer? customer { get; set; }
        public List<IFormFile>? IdentificationFile { get; set; }
        public List<IFormFile>? MarriageCertificate { get; set; }
        public string? deletedImages { get; set; }
    }
}
