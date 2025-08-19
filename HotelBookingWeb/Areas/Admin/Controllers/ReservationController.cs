using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTO;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagment.Controllers
{
    [Area("Admin")]
    [Route("Admin/[controller]/[action]")]
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
        public IActionResult Search([FromBody] ReservationSearchDTO rsd)
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

            if (rsd.RoomType == "Single")
            {
                var availableRooms = _UOF.SingleRooms.GetAll(r => !notAv.Contains(r.Id));
                return Ok(availableRooms);

            }
            else if (rsd.RoomType == "Double")
            {
                var availableRooms = _UOF.DoubleRooms.GetAll(r => !notAv.Contains(r.Id));
                return Ok(availableRooms);

            }
            else if (rsd.RoomType == "Suite")
            {
                var availableRooms = _UOF.Suites.GetAll(r => !notAv.Contains(r.Id));
                return Ok(availableRooms);
        }

            return Ok("Omda");
        }
        [HttpGet]
        public IActionResult GetByDate([FromBody] GetByDateDTO Date)
        {
            if (Date == null)
            {
                return NotFound("Invalid date provided.");
            }
            var reservation = _UOF.Reservations.Get(r => r.CheckInDate.Day == Date.day.Day);

            if (reservation == null)
            {
                return NotFound("No reservation found for this date.");
            }
            return Ok(reservation);
        }
    }
}
