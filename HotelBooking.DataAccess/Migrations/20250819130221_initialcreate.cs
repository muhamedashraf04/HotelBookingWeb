using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class initialcreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                    IdentificationAttachment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsMarried = table.Column<bool>(type: "bit", nullable: false),
                    MarriageCertificateNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarriageCertificateAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarriedToCustomerId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DoubleRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoubleRooms", x => x.Id);
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
                    NumberOfAdults = table.Column<int>(type: "int", nullable: false),
                    NumberOfChildren = table.Column<int>(type: "int", nullable: false),
                    NumberOfExtraBeds = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SingleRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SingleRooms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suites", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Address", "Age", "BirthDate", "Email", "IdentificationAttachment", "IdentificationNumber", "IdentificationType", "IsMarried", "MarriageCertificateAttachment", "MarriageCertificateNumber", "MarriedToCustomerId", "Name", "Nationality", "PhoneNumber" },
                values: new object[,]
                {
                    { 1, "Cairo, Egypt", 0, new DateOnly(1995, 3, 12), "john.ahmady@gmail.com", "id1.jpg", "30105060784512", "National ID", true, "mc1.pdf", "MC123456", "2", "John El Ahmady", "Egyptian", "01022289755" },
                    { 2, "Giza, Egypt", 0, new DateOnly(1997, 7, 21), "sara.mahmoud@gmail.com", "passport2.jpg", "A23456789", "Passport", true, "mc1.pdf", "MC123456", "1", "Sara Mahmoud", "Egyptian", "01144556677" },
                    { 3, "New York, USA", 0, new DateOnly(1990, 11, 4), "m.smith@example.com", "passport3.png", "X98765432", "Passport", false, null, null, null, "Michael Smith", "American", "+1-202-555-0188" },
                    { 4, "Alexandria, Egypt", 0, new DateOnly(1998, 1, 1), "fatima.ali@example.com", "id4.png", "29801011234567", "National ID", false, null, null, null, "Fatima Ali", "Egyptian", "01234567890" },
                    { 5, "London, UK", 0, new DateOnly(1988, 5, 30), "david.johnson@example.co.uk", "dl5.pdf", "DLUK998877", "Driver License", true, "mc5.pdf", "UKMC554433", null, "David Johnson", "British", "+44-7700-900123" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "DoubleRooms");

            migrationBuilder.DropTable(
                name: "Reservations");

            migrationBuilder.DropTable(
                name: "SingleRooms");

            migrationBuilder.DropTable(
                name: "Suites");
        }
    }
}
