using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelBooking.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class DataToCustomers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Customer",
                columns: table => new
                {
                    Cust_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Full_Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Nationality = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    National_ID = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ID_Image_URL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Marriage_status = table.Column<bool>(type: "bit", nullable: true),
                    Mariage_cert_URL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone_Number = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customer", x => x.Cust_ID);
                });

            migrationBuilder.InsertData(
                table: "Customer",
                columns: new[] { "Cust_ID", "Email", "Full_Name", "ID_Image_URL", "Mariage_cert_URL", "Marriage_status", "National_ID", "Nationality", "Phone_Number" },
                values: new object[,]
                {
                    { 1, "john@gmail.com", "John El Ahmady", "", "", false, "101050607845", null, 1022289755 },
                    { 2, "sarah.mostafa@gmail.com", "Sarah Mostafa", "", "", true, "298030512345", null, 1015673248 },
                    { 3, "omar.khaled@yahoo.com", "Omar Khaled", "", "", false, "300070923456", null, 1098765432 },
                    { 4, "nour.hassan@hotmail.com", "Nour El Din Hassan", "", "", true, "295112245678", null, 1122334455 },
                    { 5, "mona.adel@gmail.com", "Mona Adel", "", "", false, "301022334567", null, 1033445566 },
                    { 6, "ahmed.samir@outlook.com", "Ahmed Samir", "", "", true, "299041556789", null, 1255667788 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Customer");
        }
    }
}
