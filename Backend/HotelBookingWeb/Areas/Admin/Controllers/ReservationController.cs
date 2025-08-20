using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTOs;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Mvc;

[Area("Admin")]
[Route("Admin/[controller]/[action]")]
public class ReservationController : Controller
{
    private readonly ILogger<ReservationController> _logger;
    private IUnitOfWork _unitOfWork;

    public ReservationController(ILogger<ReservationController> logger, IUnitOfWork unitOfWork)
    {

        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }
    [HttpGet]
    public IActionResult GetAll()
    {
        IList<Reservation> reservations = _unitOfWork.Reservations.GetAll().ToList();
        return Ok(reservations);
    }

    public IActionResult Remove(int? id)
    {
        if (id == null)
            return BadRequest("Id is required.");

        var removed = _unitOfWork.Reservations.Remove(id.Value);

        if (removed)
        {
            _unitOfWork.Save();
            return Ok("Object removed successfully.");
        }
        else
        {
            return NotFound("Object not found.");
        }
    }

    [HttpPost]
    public IActionResult Search([FromBody] ReservationSearchDTO rsd)
    {
        if (string.IsNullOrEmpty(rsd.RoomType) || !rsd.CheckIn.HasValue || !rsd.CheckOut.HasValue)
        {
            return BadRequest("Invalid search parameters. Please provide valid CheckIn, CheckOut dates and RoomType.");
        }

        if (rsd.CheckIn >= rsd.CheckOut)
        {
            return BadRequest("Check-in date must be before Check-out date.");
        }


        var notAvailable = _unitOfWork.Reservations
            .GetAll()
            .Where(r => !(rsd.CheckOut.Value <= r.CheckInDate || rsd.CheckIn.Value >= r.CheckOutDate))
            .Select(r => r.RoomId)
            .ToList();
        
        switch (rsd.RoomType)
        {
            case "Single":
                var singleRooms = _unitOfWork.SingleRooms.GetAll().Where(r => !notAvailable.Contains(r.Id));
                return Ok(singleRooms);

            case "Double":
                var doubleRooms = _unitOfWork.DoubleRooms.GetAll().Where(r => !notAvailable.Contains(r.Id));
                return Ok(doubleRooms);

            case "Suite":
                var suites = _unitOfWork.Suites.GetAll().Where(r => !notAvailable.Contains(r.Id));
                return Ok(suites);

            default:
                return BadRequest("Invalid RoomType. Must be Single, Double, or Suite.");
        }
    }

}
