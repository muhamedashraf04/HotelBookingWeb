using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using Microsoft.AspNetCore.Mvc;

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
        [HttpPost]
        public IActionResult Upsert([FromBody] Room room)
        {   
            
            string RoomType = room.RoomType;
            if (ModelState.IsValid)
            {
                if (RoomType == "Single")
                {
                    SingleRoom singleRoom = null;

                    if (room.Id == 0 || (singleRoom = _unitOfWork.SingleRooms.Get(u => u.Id == room.Id)) == null)
                    {
                        // New Room
                        singleRoom = new SingleRoom{
                            Floor = room.Floor,
                            RoomNumber = room.RoomNumber,
                            Capacity = room.Capacity,
                            IsAvailable = room.IsAvailable,
                            RoomType = room.RoomType
                        };
                        _unitOfWork.SingleRooms.Create(singleRoom);
                        _unitOfWork.Save();
                        return Ok();
                    }

                    // Common property mapping
                    singleRoom.IsAvailable = room.IsAvailable;
                    singleRoom.Capacity = room.Capacity;
                    singleRoom.Floor = room.Floor;
                    singleRoom.RoomNumber = room.RoomNumber;
                    singleRoom.RoomType = room.RoomType;

                    // If editing, EF is already tracking it since we fetched it
                    _unitOfWork.SingleRooms.Edit(singleRoom);

                    _unitOfWork.Save();
                    return Ok();
                }

                if (RoomType == "Double")
                {
                    DoubleRoom doubleRoom = new DoubleRoom

                    {
                        IsAvailable = room.IsAvailable,
                        Capacity = room.Capacity,
                        Floor = room.Floor,
                        Id = room.Id,
                        RoomNumber = room.RoomNumber,
                        RoomType = room.RoomType,
                    };
                    _unitOfWork.DoubleRooms.Edit(doubleRoom);
                    _unitOfWork.Save();
                    return Ok();
                }
                if (RoomType == "Suite")
                {
                    Suite suite = new Suite

                    {
                        IsAvailable = room.IsAvailable,
                        Capacity = room.Capacity,
                        Floor = room.Floor,
                        Id = room.Id,
                        RoomNumber = room.RoomNumber,
                        RoomType = room.RoomType,
                    };
                    _unitOfWork.Suites.Edit(suite); 
                    _unitOfWork.Save();
                    return Ok();
                }

            }

            return BadRequest();
        }
        public IActionResult GetAll()
        {
            var rooms = new List<Room>();
            rooms.AddRange(_unitOfWork.SingleRooms.GetAll());
            rooms.AddRange(_unitOfWork.DoubleRooms.GetAll());
            rooms.AddRange(_unitOfWork.Suites.GetAll());

            return Ok(rooms.ToList());
        }
        [HttpDelete]
        public IActionResult Remove(int? Id, string RoomType)
        {
            if (Id == null)
            {
                return BadRequest();
            }
            else
            {
                if (RoomType == "Single")
                {
                    _unitOfWork.SingleRooms.Remove(Id.Value);
                }
                if (RoomType == "Double")
                {
                    _unitOfWork.DoubleRooms.Remove(Id.Value);
                }
                if (RoomType == "Suite")
                {
                    _unitOfWork.Suites.Remove(Id.Value);
                }
                _unitOfWork.Save();
                return Ok();
            }

        }
    }
}
