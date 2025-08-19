using HotelBooking.Models.Models;
using HotelBooking.Models.RoomModels;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.DataAccess.Data
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {

        }
        public DbSet<Customer> Customer { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<SingleRoom> SingleRooms { get; set; }
        public DbSet<DoubleRoom> DoubleRooms { get; set; }
        public DbSet<Suite> Suites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>().HasData(

    new Customer
    {
        Id = 1,
        Name = "John El Ahmady",
        PhoneNumber = "01022289755",
        Address = "Cairo, Egypt",
        Nationality = "Egyptian",
        IdentificationType = "National ID",
        IdentificationNumber = "30105060784512",
        IdentificationAttachment = "id1.jpg",
        BirthDate = new DateOnly(1995, 3, 12),
        Email = "john.ahmady@gmail.com",
        IsMarried = true,
        MarriageCertificateNumber = "MC123456",
        MarriageCertificateAttachment = "mc1.pdf",
        MarriedToCustomerId = "2"
    },
    new Customer
    {
        Id = 2,
        Name = "Sara Mahmoud",
        PhoneNumber = "01144556677",
        Address = "Giza, Egypt",
        Nationality = "Egyptian",
        IdentificationType = "Passport",
        IdentificationNumber = "A23456789",
        IdentificationAttachment = "passport2.jpg",
        BirthDate = new DateOnly(1997, 7, 21),
        Email = "sara.mahmoud@gmail.com",
        IsMarried = true,
        MarriageCertificateNumber = "MC123456",
        MarriageCertificateAttachment = "mc1.pdf",
        MarriedToCustomerId = "1"
    },
    new Customer
    {
        Id = 3,
        Name = "Michael Smith",
        PhoneNumber = "+1-202-555-0188",
        Address = "New York, USA",
        Nationality = "American",
        IdentificationType = "Passport",
        IdentificationNumber = "X98765432",
        IdentificationAttachment = "passport3.png",
        BirthDate = new DateOnly(1990, 11, 4),
        Email = "m.smith@example.com",
        IsMarried = false
    },
    new Customer
    {
        Id = 4,
        Name = "Fatima Ali",
        PhoneNumber = "01234567890",
        Address = "Alexandria, Egypt",
        Nationality = "Egyptian",
        IdentificationType = "National ID",
        IdentificationNumber = "29801011234567",
        IdentificationAttachment = "id4.png",
        BirthDate = new DateOnly(1998, 1, 1),
        Email = "fatima.ali@example.com",
        IsMarried = false
    },
    new Customer
    {
        Id = 5,
        Name = "David Johnson",
        PhoneNumber = "+44-7700-900123",
        Address = "London, UK",
        Nationality = "British",
        IdentificationType = "Driver License",
        IdentificationNumber = "DLUK998877",
        IdentificationAttachment = "dl5.pdf",
        BirthDate = new DateOnly(1988, 5, 30),
        Email = "david.johnson@example.co.uk",
        IsMarried = true,
        MarriageCertificateNumber = "UKMC554433",
        MarriageCertificateAttachment = "mc5.pdf",
        MarriedToCustomerId = null
    }
);
        }
    }
}
