using HotelBooking.Models.Auth;
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

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<SingleRoom> SingleRooms { get; set; }
        public DbSet<DoubleRoom> DoubleRooms { get; set; }
        public DbSet<Suite> Suites { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reservation>().HasData(
                new Reservation
                {
                    Id = 6,
                    CustomerId = 1,
                    RoomId = 1,
                    RoomType = "Single",
                    CheckInDate = new DateTime(2025, 8, 5),
                    CheckOutDate = new DateTime(2025, 8, 10),
                    NumberOfAdults = 2,
                    NumberOfChildren = 1,
                    NumberOfExtraBeds = 0,
                    createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
                },
                new Reservation
                {
                    Id = 7,
                    CustomerId = 1,
                    RoomId = 1,
                    RoomType = "Single",
                    CheckInDate = new DateTime(2025, 8, 6),
                    CheckOutDate = new DateTime(2025, 8, 10),
                    NumberOfAdults = 2,
                    NumberOfChildren = 1,
                    NumberOfExtraBeds = 0,
                    createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
                },
    new Reservation
    {
        Id = 1,
        CustomerId = 1,
        RoomId = 1,
        RoomType = "Single",
        CheckInDate = new DateTime(2025, 8, 25),
        CheckOutDate = new DateTime(2025, 8, 28),
        NumberOfAdults = 2,
        NumberOfChildren = 1,
        NumberOfExtraBeds = 0,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
    },
    new Reservation
    {
        Id = 2,
        CustomerId = 2,
        RoomId = 2,
        RoomType = "Double",
        CheckInDate = new DateTime(2025, 9, 1),
        CheckOutDate = new DateTime(2025, 9, 5),
        NumberOfAdults = 2,
        NumberOfChildren = 0,
        NumberOfExtraBeds = 1,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
    },
    new Reservation
    {
        Id = 3,
        CustomerId = 3,
        RoomId = 3,
        RoomType = "Suite",
        CheckInDate = new DateTime(2025, 9, 10),
        CheckOutDate = new DateTime(2025, 9, 15),
        NumberOfAdults = 4,
        NumberOfChildren = 2,
        NumberOfExtraBeds = 1,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
    },
    new Reservation
    {
        Id = 4,
        RoomId = 4,
        RoomType = "Single",
        CheckInDate = new DateTime(2025, 10, 1),
        CheckOutDate = new DateTime(2025, 10, 3),
        NumberOfAdults = 1,
        NumberOfChildren = 0,
        NumberOfExtraBeds = 0,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
    }
);

            modelBuilder.Entity<SingleRoom>().HasData(
           new SingleRoom { Id = 1, RoomNumber = "S01", Floor = 1, IsAvailable = true },
           new SingleRoom { Id = 2, RoomNumber = "S02", Floor = 1, IsAvailable = true },
           new SingleRoom { Id = 3, RoomNumber = "S03", Floor = 1, IsAvailable = true },
           new SingleRoom { Id = 4, RoomNumber = "S04", Floor = 1, IsAvailable = true },
           new SingleRoom { Id = 5, RoomNumber = "S05", Floor = 1, IsAvailable = true }
       );

            // Seed Double Rooms
            modelBuilder.Entity<DoubleRoom>().HasData(
                new DoubleRoom { Id = 6, RoomNumber = "D01", Floor = 2, IsAvailable = true,      },
                new DoubleRoom { Id = 7, RoomNumber = "D02", Floor = 2, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new DoubleRoom { Id = 8, RoomNumber = "D03", Floor = 2, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new DoubleRoom { Id = 9, RoomNumber = "D04", Floor = 2, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new DoubleRoom { Id = 10, RoomNumber = "D05", Floor = 2, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) }
            );

            // Seed Suite Rooms
            modelBuilder.Entity<Suite>().HasData(
                new Suite { Id = 11, RoomNumber = "SU01", Floor = 3, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new Suite { Id = 12, RoomNumber = "SU02", Floor = 3, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new Suite { Id = 13, RoomNumber = "SU03", Floor = 3, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new Suite { Id = 14, RoomNumber = "SU04", Floor = 3, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) },
                new Suite { Id = 15, RoomNumber = "SU05", Floor = 3, IsAvailable = true , createdAt = new DateTime(2025, 8, 25, 0, 0, 0) }
            );
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
        IsMarried = false,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
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
        IsMarried = false,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
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
        IsMarried = false,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
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
        IsMarried = false,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
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
        IsMarried = false,
        MarriedToCustomerId = null,
        createdAt = new DateTime(2025, 8, 25, 0, 0, 0)
    }
);
        }
    }
}
