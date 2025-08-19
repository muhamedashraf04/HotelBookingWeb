using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class SeedRooms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "DoubleRooms",
                columns: new[] { "Id", "Capacity", "Floor", "IsAvailable", "RoomNumber" },
                values: new object[,]
                {
                    { 6, 2, 2, true, "D01" },
                    { 7, 2, 2, true, "D02" },
                    { 8, 2, 2, true, "D03" },
                    { 9, 2, 2, true, "D04" },
                    { 10, 2, 2, true, "D05" }
                });

            migrationBuilder.InsertData(
                table: "SingleRooms",
                columns: new[] { "Id", "Capacity", "Floor", "IsAvailable", "RoomNumber" },
                values: new object[,]
                {
                    { 1, 1, 1, true, "S01" },
                    { 2, 1, 1, true, "S02" },
                    { 3, 1, 1, true, "S03" },
                    { 4, 1, 1, true, "S04" },
                    { 5, 1, 1, true, "S05" }
                });

            migrationBuilder.InsertData(
                table: "Suites",
                columns: new[] { "Id", "Capacity", "Floor", "IsAvailable", "RoomNumber" },
                values: new object[,]
                {
                    { 11, 3, 3, true, "SU01" },
                    { 12, 3, 3, true, "SU02" },
                    { 13, 3, 3, true, "SU03" },
                    { 14, 3, 3, true, "SU04" },
                    { 15, 3, 3, true, "SU05" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "SingleRooms",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "SingleRooms",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "SingleRooms",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "SingleRooms",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "SingleRooms",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 15);
        }
    }
}
