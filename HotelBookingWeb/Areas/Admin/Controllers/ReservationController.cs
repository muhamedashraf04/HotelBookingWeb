using HotelBooking.DataAccess;
using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTO;
using HotelBooking.Models.Models;
using HotelBooking.Models.RoomModels;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagment.Controllers
{
    public class ReservationController : Controller
    {
        private readonly IUnitOfWork _UOF;
        public ReservationController(IUnitOfWork UOF)
        {
            _UOF = UOF;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult Search(ReservationSearchDTO rsd )
        {
            if (String.IsNullOrEmpty(rsd.RoomType) || !rsd.CheckIn.HasValue || !rsd.CheckOut.HasValue)
            {
                return NotFound("Invalid search parameters. Please provide valid CheckIn, CheckOut dates and RoomType.");
            }

            if (rsd.CheckIn >= rsd.CheckOut)
            {
                return NotFound("Check-in date must be before Check-out date.");
            }
            List<int> notAv = _UOF.Reservations.GetAll(r => !(rsd.CheckOut <= r.CheckInDate || rsd.CheckIn >= r.CheckOutDate)).Select(r => r.RoomId).ToList();

            if (rsd.RoomType == "Sinlge")
            {
                var availableRooms = _UOF.SingleRooms.GetAll(r => ! notAv.Contains(r.Id));
                return View(availableRooms);

            }
            else if (rsd.RoomType == "Double")
                {
                var availableRooms = _UOF.DoubleRooms.GetAll(r => !notAv.Contains(r.Id));
                return View(availableRooms);
                    
                }
            else if (rsd.RoomType == "Suite")
            {
                var availableRooms = _UOF.Suites.GetAll(r => !notAv.Contains(r.Id));
                return View(availableRooms);
            }

            return View("Index");
        }
    }
}
