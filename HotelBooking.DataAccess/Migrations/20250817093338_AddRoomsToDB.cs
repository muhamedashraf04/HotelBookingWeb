using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomsToDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Room",
                columns: table => new
                {
                    Room_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Room_Num = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<double>(type: "float", nullable: false),
                    Reservation_status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.Room_Id);
                });

            migrationBuilder.InsertData(
                table: "Room",
                columns: new[] { "Room_Id", "Floor", "Price", "Reservation_status", "Room_Num", "Type" },
                values: new object[,]
                {
                    { 1, 1, 500.0, false, "101", "Single" },
                    { 2, 1, 800.0, false, "102", "Double" },
                    { 3, 1, 1500.0, false, "103", "Suite" },
                    { 4, 2, 550.0, false, "201", "Single" },
                    { 5, 2, 900.0, false, "202", "Double" },
                    { 6, 3, 1200.0, false, "301", "Deluxe" },
                    { 7, 3, 1700.0, false, "302", "Suite" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Room");
        }
    }
}
