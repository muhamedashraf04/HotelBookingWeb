using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Initial1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 2,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 3,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 4,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 5,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 6,
                column: "createdAt",
                value: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 7,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 8,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 9,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 10,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 1,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 2,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 3,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 4,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 6,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 7,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 11,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 12,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 13,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 14,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 15,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2258));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 2,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2280));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 3,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2284));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 4,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2288));

            migrationBuilder.UpdateData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 5,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(2464));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 6,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9607));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 7,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9624));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 8,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9627));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 9,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9630));

            migrationBuilder.UpdateData(
                table: "DoubleRooms",
                keyColumn: "Id",
                keyValue: 10,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(9632));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 1,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2516));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 2,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2522));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 3,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2525));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 4,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2528));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 6,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 819, DateTimeKind.Local).AddTicks(2065));

            migrationBuilder.UpdateData(
                table: "Reservations",
                keyColumn: "Id",
                keyValue: 7,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 821, DateTimeKind.Local).AddTicks(2495));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 11,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(130));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 12,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(140));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 13,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(142));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 14,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(145));

            migrationBuilder.UpdateData(
                table: "Suites",
                keyColumn: "Id",
                keyValue: 15,
                column: "createdAt",
                value: new DateTime(2025, 8, 25, 10, 15, 43, 822, DateTimeKind.Local).AddTicks(147));
        }
    }
}
