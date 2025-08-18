using HotelBooking.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.DataAccess.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {

        }
        public DbSet<Customer> Customer { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>().HasData(
               new Customer
               {
                   Cust_Id = 1,
                   Full_Name = "John El Ahmady",
                   National_ID = "101050607845",
                   Email = "john@gmail.com",
                   ID_Image_URL = "",
                   Marriage_status = false,
                   Mariage_cert_URL = "",
                   Nationality = "Egypt",
                   Phone_Number = 01022289755
               },
                new Customer
                {
                    Cust_Id = 2,
                    Full_Name = "Sarah Mostafa",
                    National_ID = "298030512345",
                    Email = "sarah.mostafa@gmail.com",
                    ID_Image_URL = "",
                    Marriage_status = true,
                    Mariage_cert_URL = "",
                    Nationality = "Egypt",
                    Phone_Number = 01015673248
                },
                new Customer
                {
                    Cust_Id = 3,
                    Full_Name = "Omar Khaled",
                    National_ID = "300070923456",
                    Email = "omar.khaled@yahoo.com",
                    ID_Image_URL = "",
                    Marriage_status = false,
                    Mariage_cert_URL = "",
                    Nationality = "Brazil",
                    Phone_Number = 01098765432
                },
                new Customer
                {
                    Cust_Id = 4,
                    Full_Name = "Nour El Din Hassan",
                    National_ID = "295112245678",
                    Email = "nour.hassan@hotmail.com",
                    ID_Image_URL = "",
                    Marriage_status = true,
                    Mariage_cert_URL = "",
                    Nationality = "Brazil",
                    Phone_Number = 01122334455
                },
                new Customer
                {
                    Cust_Id = 5,
                    Full_Name = "Mona Adel",
                    National_ID = "301022334567",
                    Email = "mona.adel@gmail.com",
                    ID_Image_URL = "",
                    Marriage_status = false,
                    Mariage_cert_URL = "",
                    Nationality = "Brazil",
                    Phone_Number = 01033445566
                },
                new Customer
                {
                    Cust_Id = 6,
                    Full_Name = "Ahmed Samir",
                    National_ID = "299041556789",
                    Email = "ahmed.samir@outlook.com",
                    ID_Image_URL = "",
                    Marriage_status = true,
                    Mariage_cert_URL = "",
                    Nationality = "Brazil",
                    Phone_Number = 01255667788
                }
             );
        }
    }
}
