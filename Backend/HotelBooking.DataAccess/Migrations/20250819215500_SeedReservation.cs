using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class SeedReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Reservations",
                columns: new[] { "Id", "CheckInDate", "CheckOutDate", "CustomerId", "NumberOfAdults", "NumberOfChildren", "NumberOfExtraBeds", "RoomId", "RoomType" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 2, 1, 0, 1, "Single" },
                    { 2, new DateTime(2025, 9, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 2, 0, 1, 2, "Double" },
                    { 3, new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 9, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 4, 2, 1, 3, "Suite" },
                    { 4, new DateTime(2025, 10, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 10, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 1, 0, 0, 4, "Single" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
