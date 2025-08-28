using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace HotelBookingWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Route("Admin/[controller]/[action]")]
    public class RateController : Controller
    {
        private readonly ILogger<RateController> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public RateController(ILogger<RateController> logger, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        // Upsert: create or update a rate
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Upsert([FromBody] Rate rate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid rate data.");
            }

            // Prevent duplicate Type for different records
            var existingByType = _unitOfWork.Rates.Get(u => u.Type == rate.Type);
            if (existingByType != null && existingByType.Id != rate.Id)
            {
                return BadRequest("A rate with this Type already exists.");
            }

            var dbRate = _unitOfWork.Rates.Get(u => u.Id == rate.Id);

            if (dbRate == null)
            {
                // Create
                var newRate = new Rate
                {
                    Type = rate.Type,
                    Price = rate.Price,
                    createdBy = User.Identity?.Name,
                    updatedBy = User.Identity?.Name
                };

                _unitOfWork.Rates.Create(newRate);
            }
            else
            {
                // Update
                dbRate.Type = rate.Type;
                dbRate.Price = rate.Price;
                dbRate.updatedBy = User.Identity?.Name;

                _unitOfWork.Rates.Edit(dbRate);
            }

            _unitOfWork.Save();
            return Ok();
        }

        // Get all rates
        [HttpGet]
        public IActionResult GetAll()
        {
            var rates = _unitOfWork.Rates.GetAll();
            return Ok(rates.ToList());
        }

        // Get single rate by id
        [HttpGet]
        public IActionResult GetRate(int id)
        {
            var rate = _unitOfWork.Rates.Get(u => u.Id == id);
            if (rate == null) return BadRequest();
            return Ok(rate);
        }

        // Remove a rate - prevent deletion if any room uses this rate Type
        [HttpDelete]
        public IActionResult Remove(int? Id)
        {
            if (Id == null) return BadRequest();

            var rate = _unitOfWork.Rates.Get(u => u.Id == Id.Value);
            if (rate == null) return BadRequest("Rate not found.");

            // If any room uses this rate type, block deletion
            var roomUsing = _unitOfWork.Rooms.Get(u => u.RoomType == rate.Type);
            if (roomUsing != null)
            {
                return BadRequest("Can't delete rate because one or more rooms use it.");
            }

            _unitOfWork.Rates.Remove(Id.Value);
            _unitOfWork.Save();
            return Ok();
        }

        // Refresh: apply current rates to rooms (used by frontend PATCH Admin/Rate/Refresh)
        [HttpPatch]
        public async Task<IActionResult> Refresh()
        {
            var rooms = await _unitOfWork.Rooms.GetAllAsync();

            foreach (var room in rooms)
            {
                var rate = await _unitOfWork.Rates.GetAsync(u => u.Type == room.RoomType);
                if (rate != null && rate.Price != room.Price)
                {
                    room.Price = rate.Price;
                    _unitOfWork.Rooms.Edit(room);
                }
            }

            await _unitOfWork.SaveAsync();
            return Ok("Room prices refreshed from rates.");
        }
    }
}
