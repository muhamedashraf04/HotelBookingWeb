using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddNationalitlyToDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 1,
                column: "Nationality",
                value: "Egypt");

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 2,
                column: "Nationality",
                value: "Egypt");

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 3,
                column: "Nationality",
                value: "Brazil");

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 4,
                column: "Nationality",
                value: "Brazil");

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 5,
                column: "Nationality",
                value: "Brazil");

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 6,
                column: "Nationality",
                value: "Brazil");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 1,
                column: "Nationality",
                value: null);

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 2,
                column: "Nationality",
                value: null);

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 3,
                column: "Nationality",
                value: null);

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 4,
                column: "Nationality",
                value: null);

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 5,
                column: "Nationality",
                value: null);

            migrationBuilder.UpdateData(
                table: "Customer",
                keyColumn: "Cust_ID",
                keyValue: 6,
                column: "Nationality",
                value: null);
        }
    }
}
