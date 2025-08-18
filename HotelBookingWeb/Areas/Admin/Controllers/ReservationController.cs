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
            if( String.IsNullOrEmpty(RoomType) || !CheckIn.HasValue || !CheckOut.HasValue)
            {
                return NotFound("Invalid search parameters. Please provide valid CheckIn, CheckOut dates and RoomType.");
            }

            ICollection<Room> unAvailableRooms;

            var from = CheckIn.Value;
            var to = CheckOut.Value;

            foreach (var reservation in _db.Reservations)
            {
                if (CheckOut <= reservation.CheckInDate || CheckIn >= reservation.CheckOutDate) // " = hanshofha "
                {
                var availableRooms = _db.DoubleRooms.Where(r => !notAv.Contains(r.Id)).ToList();
                return View(availableRooms);
                    
                }
            else if (RoomType == "Suite")
            {
                var availableRooms = _db.Suites.Where(r => !notAv.Contains(r.Id)).ToList();
                return View(availableRooms);
            }

            return View("Index");
        }
    }
}
