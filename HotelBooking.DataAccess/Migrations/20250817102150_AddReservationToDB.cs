using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationToDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Cust_ID",
                table: "Customer",
                newName: "Cust_Id");

            migrationBuilder.CreateTable(
                name: "Reservation",
                columns: table => new
                {
                    Reservation_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Check_In = table.Column<DateOnly>(type: "date", nullable: false),
                    Check_Out = table.Column<DateOnly>(type: "date", nullable: false),
                    Customer_Id = table.Column<int>(type: "int", nullable: false),
                    Room_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservation", x => x.Reservation_Id);
                    table.ForeignKey(
                        name: "FK_Reservation_Customer_Customer_Id",
                        column: x => x.Customer_Id,
                        principalTable: "Customer",
                        principalColumn: "Cust_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reservation_Room_Room_Id",
                        column: x => x.Room_Id,
                        principalTable: "Room",
                        principalColumn: "Room_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Reservation",
                columns: new[] { "Reservation_Id", "Check_In", "Check_Out", "Customer_Id", "Room_Id" },
                values: new object[,]
                {
                    { 1, new DateOnly(2025, 8, 20), new DateOnly(2025, 8, 25), 1, 1 },
                    { 2, new DateOnly(2025, 9, 1), new DateOnly(2025, 9, 5), 2, 2 },
                    { 3, new DateOnly(2025, 9, 10), new DateOnly(2025, 9, 15), 3, 3 },
                    { 4, new DateOnly(2025, 9, 20), new DateOnly(2025, 9, 22), 4, 4 },
                    { 5, new DateOnly(2025, 10, 1), new DateOnly(2025, 10, 7), 5, 5 },
                    { 6, new DateOnly(2025, 10, 10), new DateOnly(2025, 10, 12), 6, 6 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservation_Customer_Id",
                table: "Reservation",
                column: "Customer_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Reservation_Room_Id",
                table: "Reservation",
                column: "Room_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reservation");

            migrationBuilder.RenameColumn(
                name: "Cust_Id",
                table: "Customer",
                newName: "Cust_ID");
        }
    }
}
