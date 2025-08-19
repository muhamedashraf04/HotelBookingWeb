using HotelBooking.DataAccess;
using HotelBooking.DataAccess.Data;
using HotelBooking.Models.Models;
using HotelBooking.Models.RoomModels;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagment.Controllers
{
    public class ReservationController : Controller
    {
        private readonly ApplicationDBContext _db;
        public ReservationController(ApplicationDBContext db)
        {
            _db = db;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult Search(DateTime? CheckIn, DateTime? CheckOut, string RoomType)
        {
            if (String.IsNullOrEmpty(RoomType) || !CheckIn.HasValue || !CheckOut.HasValue)
            {
                return NotFound("Invalid search parameters. Please provide valid CheckIn, CheckOut dates and RoomType.");
            }

            if (CheckIn.Value.Date >= CheckOut.Value.Date)
            {
                return NotFound("Check-in date must be before Check-out date.");
            }
            List<int> notAv = _db.Reservations.Where(r => !(CheckOut <= r.CheckInDate || CheckIn >= r.CheckOutDate)).Select(r => r.RoomId).ToList();

            if (RoomType == "Sinlge")
            {
                var availableRooms = _db.SingleRooms.Where(r => ! notAv.Contains(r.Id)).ToList();
                return View(availableRooms);

            }
            else if (RoomType == "Double")
                {
                var availableRooms = _db.DoubleRooms.Where(r => !notAv.Contains(r.Id)).ToList();
                return View(availableRooms);
                    
                }
            else if (RoomType == "Suite")
            {
                var availableRooms = _db.Suites.Where(r => !notAv.Contains(r.Id)).ToList();
                return View(availableRooms);
            }
            return NotFound();
        }
    }
}
