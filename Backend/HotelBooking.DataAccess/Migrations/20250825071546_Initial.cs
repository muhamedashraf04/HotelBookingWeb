using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
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
                    IdentificationAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsMarried = table.Column<bool>(type: "bit", nullable: false),
                    MarriageCertificateNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarriageCertificateAttachment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarriedToCustomerId = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                name: "DoubleRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Images = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "SingleRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Images = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    createdAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    updatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Images = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suites", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Address", "Age", "BirthDate", "Email", "IdentificationAttachment", "IdentificationNumber", "IdentificationType", "IsMarried", "MarriageCertificateAttachment", "MarriageCertificateNumber", "MarriedToCustomerId", "Name", "Nationality", "PhoneNumber", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, "Cairo, Egypt", 0, new DateOnly(1995, 3, 12), "john.ahmady@gmail.com", "id1.jpg", "30105060784512", "National ID", false, null, null, null, "John El Ahmady", "Egyptian", "01022289755", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2258), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 2, "Giza, Egypt", 0, new DateOnly(1997, 7, 21), "sara.mahmoud@gmail.com", "passport2.jpg", "A23456789", "Passport", false, null, null, null, "Sara Mahmoud", "Egyptian", "01144556677", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2280), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 3, "New York, USA", 0, new DateOnly(1990, 11, 4), "m.smith@example.com", "passport3.png", "X98765432", "Passport", false, null, null, null, "Michael Smith", "American", "+1-202-555-0188", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2284), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 4, "Alexandria, Egypt", 0, new DateOnly(1998, 1, 1), "fatima.ali@example.com", "id4.png", "29801011234567", "National ID", false, null, null, null, "Fatima Ali", "Egyptian", "01234567890", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2288), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 5, "London, UK", 0, new DateOnly(1988, 5, 30), "david.johnson@example.co.uk", "dl5.pdf", "DLUK998877", "Driver License", false, null, null, null, "David Johnson", "British", "+44-7700-900123", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2464), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "DoubleRooms",
                columns: new[] { "Id", "Capacity", "Floor", "Images", "IsAvailable", "RoomNumber", "RoomType", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 6, 2, 2, null, true, "D01", "Double", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9607), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 7, 2, 2, null, true, "D02", "Double", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9624), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 8, 2, 2, null, true, "D03", "Double", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9627), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 9, 2, 2, null, true, "D04", "Double", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9630), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 10, 2, 2, null, true, "D05", "Double", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9632), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "Reservations",
                columns: new[] { "Id", "CheckInDate", "CheckOutDate", "CustomerId", "NumberOfAdults", "NumberOfChildren", "NumberOfExtraBeds", "RoomId", "RoomType", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 2, 1, 0, 1, "Single", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2516), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 2, new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 2, 0, 1, 2, "Double", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2522), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 3, new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 4, 2, 1, 3, "Suite", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2525), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 4, new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 10, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 1, 0, 0, 4, "Single", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2528), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 6, new DateTime(2025, 8, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 2, 1, 0, 1, "Single", new DateTime(2025, 8, 25, 10, 15, 43, 819, DateTimeKind.Local).AddTicks(2065), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 7, new DateTime(2025, 8, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 2, 1, 0, 1, "Single", new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2495), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "SingleRooms",
                columns: new[] { "Id", "Capacity", "Floor", "Images", "IsAvailable", "RoomNumber", "RoomType", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 1, 1, 1, null, true, "S01", "Single", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 2, 1, 1, null, true, "S02", "Single", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 3, 1, 1, null, true, "S03", "Single", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 4, 1, 1, null, true, "S04", "Single", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 5, 1, 1, null, true, "S05", "Single", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
                });

            migrationBuilder.InsertData(
                table: "Suites",
                columns: new[] { "Id", "Capacity", "Floor", "Images", "IsAvailable", "RoomNumber", "RoomType", "createdAt", "createdBy", "updatedAt", "updatedBy" },
                values: new object[,]
                {
                    { 11, 3, 3, null, true, "SU01", "Suite", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(130), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 12, 3, 3, null, true, "SU02", "Suite", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(140), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 13, 3, 3, null, true, "SU03", "Suite", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(142), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 14, 3, 3, null, true, "SU04", "Suite", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(145), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null },
                    { 15, 3, 3, null, true, "SU05", "Suite", new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(147), null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null }
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
