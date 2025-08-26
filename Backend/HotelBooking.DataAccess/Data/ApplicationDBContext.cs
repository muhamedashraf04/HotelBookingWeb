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
        public DbSet<Room> Rooms { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reservation>().HasData(
            new Reservation
            {
                Id = 1,
                CustomerId = 1, // assume seeded customer
                RoomId = 1,     // S001 (Single)
                RoomType = "Single",
                CheckInDate = new DateTime(2025, 9, 1),
                CheckOutDate = new DateTime(2025, 9, 10),
                Paid = 200,
                Dues = 0,
                ProofOfPayment = "",
                Discount = 0,
                NumberOfAdults = 1,
                NumberOfChildren = 0,
                NumberOfExtraBeds = 0,
                createdAt = new DateTime(2025, 1, 1),
                updatedAt = new DateTime(2025, 1, 1)
            },
            new Reservation
            {
                Id = 2,
                CustomerId = 2,
                RoomId = 1,  // same Single room, different interval
                RoomType = "Single",
                CheckInDate = new DateTime(2025, 9, 12),
                CheckOutDate = new DateTime(2025, 9, 15),
                Paid = 150,
                Dues = 0,
                ProofOfPayment = "",
                Discount = 0,
                NumberOfAdults = 1,
                NumberOfChildren = 1,
                NumberOfExtraBeds = 0,
                createdAt = new DateTime(2025, 1, 1),
                updatedAt = new DateTime(2025, 1, 1)
            },
            new Reservation
            {
                Id = 3,
                CustomerId = 3,
                RoomId = 101, // D001 (Double)
                RoomType = "Double",
                CheckInDate = new DateTime(2025, 9, 5),
                CheckOutDate = new DateTime(2025, 9, 8),
                Paid = 300,
                Dues = 50,
                ProofOfPayment = "",
                Discount = 10,
                NumberOfAdults = 2,
                NumberOfChildren = 1,
                NumberOfExtraBeds = 1,
                createdAt = new DateTime(2025, 1, 1),
                updatedAt = new DateTime(2025, 1, 1)
            },
            new Reservation
            {
                Id = 4,
                CustomerId = 4,
                RoomId = 201, // SU001 (Suite)
                RoomType = "Suite",
                CheckInDate = new DateTime(2025, 9, 15),
                CheckOutDate = new DateTime(2025, 9, 20),
                Paid = 1000,
                Dues = 200,
                ProofOfPayment = "",
                Discount = 5,
                NumberOfAdults = 4,
                NumberOfChildren = 2,
                NumberOfExtraBeds = 2,
                createdAt = new DateTime(2025, 1, 1),
                updatedAt = new DateTime(2025, 1, 1)
            }
        );
            var singleRooms = Enumerable.Range(1, 10).Select(i => new Room
            {
                Id = i,
                RoomNumber = $"S{i:000}",
                Floor = (i - 1) / 5 + 1,   // 5 rooms per floor
                Capacity = 1,
                RoomType = "Single",
                IsAvailable = true,
                Price = 0,
                Images = "",
                createdAt = new DateTime(2025, 8, 25, 0, 0, 0),
                updatedAt = new DateTime(2025, 8, 25, 0, 0, 0)
            });

            // --- Seed Double Rooms ---
            var doubleRooms = Enumerable.Range(1, 10).Select(i => new Room
            {
                Id = 100 + i,
                RoomNumber = $"D{i:000}",
                Floor = (i - 1) / 5 + 2,
                Capacity = 2,
                RoomType = "Double",
                IsAvailable = true,
                Price = 0,
                Images = "",
                createdAt = new DateTime(2025, 8, 25, 0, 0, 0),
                updatedAt = new DateTime(2025, 8, 25, 0, 0, 0)
            });

            // --- Seed Suite Rooms ---
            var suites = Enumerable.Range(1, 10).Select(i => new Room
            {
                Id = 200 + i,
                RoomNumber = $"SU{i:000}",
                Floor = (i - 1) / 5 + 3,
                Capacity = 4,
                RoomType = "Suite",
                IsAvailable = true,
                Price = 0,
                Images = "",
                createdAt = new DateTime(2025, 8, 25, 0, 0, 0),
                updatedAt = new DateTime(2025, 8, 25, 0, 0, 0)
            });

            modelBuilder.Entity<Room>().HasData(singleRooms);
            modelBuilder.Entity<Room>().HasData(doubleRooms);
            modelBuilder.Entity<Room>().HasData(suites);
            modelBuilder.Entity<Admin>().HasData(
                new Admin { Id = 1,Role = "Admin", Email = "Admin@HMS.com", createdBy = "Server", createdAt =  new DateTime(2025, 4, 25, 0, 0, 0) , updatedAt = new DateTime(2025, 4, 25, 0, 0, 0), updatedBy = "Server", UserName = "Admin", PasswordHash = "5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8" }
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
