using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using HotelBookingWeb.Areas.Guest.Controllers;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace HotelBookingWeb.Areas.Admin.Controllers
{
    public class RoomController : Controller
    {
        private readonly ILogger<RoomController> _logger;
        private IUnitOfWork _unitOfWork;

        public RoomController(ILogger<RoomController> logger, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public IActionResult Index()
        {
            IEnumerable<Room> Single = _unitOfWork.SingleRooms.GetAll().Cast<Room>().ToList();
            IEnumerable<Room> Double = _unitOfWork.DoubleRooms.GetAll().ToList();
            IEnumerable<Room> Suites = _unitOfWork.Suites.GetAll().Cast<Room>().ToList();

            List<Room> combined = new List<Room>();
            combined.AddRange(Single);
            combined.AddRange(Double);
            combined.AddRange(Suites);
            return View(combined);
        }
        public IActionResult Upsert()
        {

            return View();
        }
    }
}
