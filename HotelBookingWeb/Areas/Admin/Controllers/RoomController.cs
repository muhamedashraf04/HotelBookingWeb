using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using HotelBookingWeb.Areas.Guest.Controllers;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace HotelBookingWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Route("Admin/[controller]/[action]")]
    public class RoomController : Controller
    {
        private readonly ILogger<RoomController> _logger;
        private IUnitOfWork _unitOfWork;

        public RoomController(ILogger<RoomController> logger, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        [HttpGet]
        public IActionResult Index()
        {
            IEnumerable<Room> Single = _unitOfWork.SingleRooms.GetAll().ToList();
            IEnumerable<Room> Double = _unitOfWork.DoubleRooms.GetAll().ToList();
            IEnumerable<Room> Suites = _unitOfWork.Suites.GetAll().ToList();

            List<Room> combined = new List<Room>();
            combined.AddRange(Single);
            combined.AddRange(Double);
            combined.AddRange(Suites);
            return View(combined);
        }
        public IActionResult Upsert(int? id, string RoomType)
        {
            return View();
        }
        [HttpPost]
        public IActionResult Upsert(Room room,string RoomType)
        {
            if (ModelState.IsValid)
            {
                if (RoomType == "Single")
                {
                    _unitOfWork.SingleRooms.Create(new SingleRoom{
                        RoomNumber = room.RoomNumber,
                        Floor = room.Floor,
                        Capacity = room.Capacity,
                        IsAvailable = room.IsAvailable
                    }
                    );
                    _unitOfWork.Save();
                    return RedirectToAction("Index");
                }
                if (RoomType == "Double")
                {
                    _unitOfWork.DoubleRooms.Create(new DoubleRoom
                    {
                        RoomNumber = room.RoomNumber,
                        Floor = room.Floor,
                        Capacity = room.Capacity,
                        IsAvailable = room.IsAvailable
                    }
                    );
                    _unitOfWork.Save();
                    return RedirectToAction("Index");
                }
                if (RoomType == "Suite")
                {
                    _unitOfWork.Suites.Create(new Suite
        {
                        RoomNumber = room.RoomNumber,
                        Floor = room.Floor,
                        Capacity = room.Capacity,
                        IsAvailable = room.IsAvailable
                    }
                    );
                    _unitOfWork.Save();
                    return RedirectToAction("Index");
                }
                
            }

            return View(room);
        }
    }
}
