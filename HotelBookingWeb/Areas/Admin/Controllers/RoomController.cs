using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using HotelBookingWeb.Areas.Receptionist.Controllers;
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
        public IActionResult Upsert(int? id, int Capacity)
        {
            Room room = null;
            if (id == null || id == 0)
            { 
                return View (room);
            }
            else
            {
                if(Capacity==1)
                {
                    room=_unitOfWork.SingleRooms.Get(u=>u.Id==id);
                    return View(room);
                }
                if (Capacity == 2)
                {
                    room = _unitOfWork.DoubleRooms.Get(u => u.Id == id);
                    return View(room);
                }
                if (Capacity >= 3)
                {
                    room = _unitOfWork.Suites.Get(u => u.Id == id);
                    return View(room);
                }

            }
            return View(room);
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
