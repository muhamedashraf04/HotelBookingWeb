using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTOs;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagment.Controllers;

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
        var reservations = _unitOfWork.Reservations.GetAll();
        if (reservations == null || !reservations.Any())
        {
            return NotFound("No reservations found.");
        }
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

    [HttpGet]
    public IActionResult GetByDate([FromBody] GetByDateDTO Date)
    {
        if (Date == null)
        {
            return NotFound("Invalid date provided.");
        }
        var reservation = _unitOfWork.Reservations.Get(r => r.CheckInDate == Date.day);

        if (reservation == null)
        {
            return NotFound("No reservation found for this date.");
        }
        return Ok(reservation);
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
        List<int> notAv = _unitOfWork.Reservations.GetAll(r => !(rsd.CheckOut <= r.CheckInDate || rsd.CheckIn >= r.CheckOutDate)).Select(r => r.RoomId).ToList();

        if (rsd.RoomType == "Single")
        {
            var availableRooms = _unitOfWork.SingleRooms.GetAll(r => !notAv.Contains(r.Id));
            return Ok(availableRooms);

        }
        else if (rsd.RoomType == "Double")
        {
            var availableRooms = _unitOfWork.DoubleRooms.GetAll(r => !notAv.Contains(r.Id));
            return Ok(availableRooms);

        }
        else if (rsd.RoomType == "Suite")
        {
            var availableRooms = _unitOfWork.Suites.GetAll(r => !notAv.Contains(r.Id));
            return Ok(availableRooms);
        }

        return Ok("Omda");
    }
    [HttpPost]
    public IActionResult Create([FromBody] Reservation reservation)
    {
        if (reservation == null)
        {
            return BadRequest("Reservation data is required.");
        }
        if (reservation.CheckInDate >= reservation.CheckOutDate)
        {
            return BadRequest("Check-in date must be before Check-out date.");
        }
        var sameRoom = _unitOfWork.Reservations.Get(r => r.RoomId == reservation.RoomId);
        if (sameRoom != null)
        {
            if (reservation.CheckInDate < sameRoom.CheckOutDate &&
                reservation.CheckOutDate > sameRoom.CheckInDate)
            {
                return BadRequest("Room is already assigned in this Date");
            }
        }
        if (ModelState.IsValid)
        {
            _unitOfWork.Reservations.Create(reservation);
            _unitOfWork.Save();
            return Ok("Reservation created successfully.");
        }
        return BadRequest("Invalid reservation data. Please check the input and try again.");
    }

    [HttpPatch]
    public IActionResult Edit([FromBody] Reservation reservation)
    {
        if (reservation == null)
        {
            return BadRequest("Reservation data is required.");
        }
        if (reservation.CheckInDate >= reservation.CheckOutDate)
        {
            return BadRequest("Check-in date must be before Check-out date.");
        }
        if (ModelState.IsValid)
        {
            _unitOfWork.Reservations.Edit(reservation);
            _unitOfWork.Save();
            return Ok("Reservation updated successfully.");
        }
        return BadRequest("Invalid reservation data. Please check the input and try again.");
    }

    [HttpDelete]
    public IActionResult Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid reservation ID.");
        }
        var reservation = _unitOfWork.Reservations.Get(r => r.Id == id);
        if (reservation == null)
        {
            return NotFound("Reservation not found.");
        }
        _unitOfWork.Reservations.Remove(id);
        _unitOfWork.Save();
        return Ok("Reservation deleted successfully.");
    }

}

