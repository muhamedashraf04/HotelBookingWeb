using HotelBooking.Models.Models;
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
                   Id = "1",
                   Name = "John El Ahmady",
                   IdentificationNumber = "101050607845",
                   Email = "john@gmail.com",
                   IdentificationAttachment = "",
                   IsMarried = false,
                   MarriageCertificateAttachment = "",
                   Nationality = "Egypt",
                   PhoneNumber = "01022289755"
               },
                new Customer
                {
                    Id = "2",
                    Name = "Sara Mostafa",
                    IdentificationNumber = "201030405123",
                    Email = "sara.mostafa@gmail.com",
                    IdentificationAttachment = "",
                    IsMarried = true,
                    MarriageCertificateAttachment = "",
                    Nationality = "Egypt",
                    PhoneNumber = "01012345678"
                },
new Customer
{
    Id = "3",
    Name = "Omar Khaled",
    IdentificationNumber = "301020607890",
    Email = "omar.khaled@yahoo.com",
    IdentificationAttachment = "",
    IsMarried = false,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01123456789"
},
new Customer
{
    Id = "4",
    Name = "Mona Hassan",
    IdentificationNumber = "401050607321",
    Email = "mona.hassan@hotmail.com",
    IdentificationAttachment = "",
    IsMarried = true,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01234567890"
},
new Customer
{
    Id = "5",
    Name = "Youssef Adel",
    IdentificationNumber = "501080909876",
    Email = "youssef.adel@gmail.com",
    IdentificationAttachment = "",
    IsMarried = false,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01098765432"
},
new Customer
{
    Id = "6",
    Name = "Nourhan Ali",
    IdentificationNumber = "601020305654",
    Email = "nourhan.ali@gmail.com",
    IdentificationAttachment = "",
    IsMarried = true,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01199887766"
},
new Customer
{
    Id = "7",
    Name = "Karim Tarek",
    IdentificationNumber = "701090807432",
    Email = "karim.tarek@gmail.com",
    IdentificationAttachment = "",
    IsMarried = false,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01211223344"
},
new Customer
{
    Id = "8",
    Name = "Laila Samir",
    IdentificationNumber = "801010203987",
    Email = "laila.samir@yahoo.com",
    IdentificationAttachment = "",
    IsMarried = true,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01055443322"
},
new Customer
{
    Id = "9",
    Name = "Ahmed Yassin",
    IdentificationNumber = "901020304765",
    Email = "ahmed.yassin@gmail.com",
    IdentificationAttachment = "",
    IsMarried = false,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01166778899"
},
new Customer
{
    Id = "10",
    Name = "Hana Magdy",
    IdentificationNumber = "101010203040",
    Email = "hana.magdy@gmail.com",
    IdentificationAttachment = "",
    IsMarried = true,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01244332211"
},
new Customer
{
    Id = "11",
    Name = "Mostafa Ibrahim",
    IdentificationNumber = "111213141516",
    Email = "mostafa.ibrahim@gmail.com",
    IdentificationAttachment = "",
    IsMarried = false,
    MarriageCertificateAttachment = "",
    Nationality = "Egypt",
    PhoneNumber = "01077889966"
}

             );
        }
    }
}
