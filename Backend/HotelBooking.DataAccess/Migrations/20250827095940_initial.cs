using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Admins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Admins", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nationality = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdentificationType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdentificationNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdentificationAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsMarried = table.Column<bool>(type: "bit", nullable: false),
                    MarriageCertificateNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarriageCertificateAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarriedToCustomerId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<float>(type: "real", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reservations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    RoomId = table.Column<int>(type: "int", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CheckInDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckOutDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Paid = table.Column<float>(type: "real", nullable: false),
                    Dues = table.Column<float>(type: "real", nullable: false),
                    ProofOfPayment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Discount = table.Column<float>(type: "real", nullable: false),
                    NumberOfAdults = table.Column<int>(type: "int", nullable: false),
                    NumberOfChildren = table.Column<int>(type: "int", nullable: false),
                    NumberOfExtraBeds = table.Column<int>(type: "int", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Images = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    Price = table.Column<float>(type: "real", nullable: false),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Admins",
                columns: new[] { "Id", "Email", "PasswordHash", "Role", "UserName", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[] { 1, "Admin@HMS.com", "5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8", "Admin", "Admin", new DateTime(2025, 4, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server", new DateTime(2025, 4, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server" });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Address", "Age", "BirthDate", "Email", "IdentificationAttachment", "IdentificationNumber", "IdentificationType", "IsMarried", "MarriageCertificateAttachment", "MarriageCertificateNumber", "MarriedToCustomerId", "Name", "Nationality", "PhoneNumber", "createdAt", "createdBy", "status", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, "Cairo, Egypt", 0, new DateOnly(1995, 3, 12), "john.ahmady@gmail.com", "id1.jpg", "30105060784512", "National ID", false, null, null, null, "John El Ahmady", "Egyptian", "01022289755", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registered", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 2, "Giza, Egypt", 0, new DateOnly(1997, 7, 21), "sara.mahmoud@gmail.com", "passport2.jpg", "A23456789", "Passport", false, null, null, null, "Sara Mahmoud", "Egyptian", "01144556677", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registered", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 3, "New York, USA", 0, new DateOnly(1990, 11, 4), "m.smith@example.com", "passport3.png", "X98765432", "Passport", false, null, null, null, "Michael Smith", "American", "+1-202-555-0188", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registered", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 4, "Alexandria, Egypt", 0, new DateOnly(1998, 1, 1), "fatima.ali@example.com", "id4.png", "29801011234567", "National ID", false, null, null, null, "Fatima Ali", "Egyptian", "01234567890", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registered", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 5, "London, UK", 0, new DateOnly(1988, 5, 30), "david.johnson@example.co.uk", "dl5.pdf", "DLUK998877", "Driver License", false, null, null, null, "David Johnson", "British", "+44-7700-900123", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registered", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "Rates",
                columns: new[] { "Id", "Price", "Type", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, 1000f, "Single", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server" },
                    { 2, 1500f, "Double", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server" },
                    { 3, 3000f, "Suite", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server", new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Server" }
                });

            migrationBuilder.InsertData(
                table: "Reservations",
                columns: new[] { "Id", "CheckInDate", "CheckOutDate", "CustomerId", "Discount", "Dues", "NumberOfAdults", "NumberOfChildren", "NumberOfExtraBeds", "Paid", "ProofOfPayment", "RoomId", "RoomType", "Status", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 0f, 0f, 1, 0, 0, 200f, "", 1, "Single", "Reserved", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 2, new DateTime(2025, 9, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 0f, 0f, 1, 1, 0, 150f, "", 1, "Single", "Reserved", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 3, new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 10f, 50f, 2, 1, 1, 300f, "", 101, "Double", "Reserved", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 4, new DateTime(2025, 9, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 4, 5f, 200f, 4, 2, 2, 1000f, "", 201, "Suite", "Reserved", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Floor", "Images", "IsAvailable", "Price", "RoomNumber", "RoomType", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, 1, 1, "", true, 0f, "S001", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 2, 1, 1, "", true, 0f, "S002", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 3, 1, 1, "", true, 0f, "S003", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 4, 1, 1, "", true, 0f, "S004", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 5, 1, 1, "", true, 0f, "S005", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 6, 1, 2, "", true, 0f, "S006", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 7, 1, 2, "", true, 0f, "S007", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 8, 1, 2, "", true, 0f, "S008", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 9, 1, 2, "", true, 0f, "S009", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 10, 1, 2, "", true, 0f, "S010", "Single", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 101, 2, 2, "", true, 0f, "D001", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 102, 2, 2, "", true, 0f, "D002", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 103, 2, 2, "", true, 0f, "D003", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 104, 2, 2, "", true, 0f, "D004", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 105, 2, 2, "", true, 0f, "D005", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 106, 2, 3, "", true, 0f, "D006", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 107, 2, 3, "", true, 0f, "D007", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 108, 2, 3, "", true, 0f, "D008", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 109, 2, 3, "", true, 0f, "D009", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 110, 2, 3, "", true, 0f, "D010", "Double", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 201, 4, 3, "", true, 0f, "SU001", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 202, 4, 3, "", true, 0f, "SU002", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 203, 4, 3, "", true, 0f, "SU003", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 204, 4, 3, "", true, 0f, "SU004", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 205, 4, 3, "", true, 0f, "SU005", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 206, 4, 4, "", true, 0f, "SU006", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 207, 4, 4, "", true, 0f, "SU007", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 208, 4, 4, "", true, 0f, "SU008", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 209, 4, 4, "", true, 0f, "SU009", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 210, 4, 4, "", true, 0f, "SU010", "Suite", new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admins");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "Rates");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
