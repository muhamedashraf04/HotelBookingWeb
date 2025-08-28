using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTOs;
using HotelBooking.Models.Models;
using HotelBooking.Models.RoomModels;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

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


    [HttpPost]
    public IActionResult Search([FromBody] ReservationSearchDTO rsd)
    {
        if (string.IsNullOrEmpty(rsd.RoomType) || !rsd.CheckInDate.HasValue || !rsd.CheckOutDate.HasValue)
        {
            return BadRequest("Invalid search parameters. Please provide valid CheckIn, CheckOut dates and RoomType.");
        }

        if (rsd.CheckInDate >= rsd.CheckOutDate)
        {
            return BadRequest("Check-in date must be before Check-out date.");
        }

        var reservations = _unitOfWork.Reservations.GetAll(
            r => r.RoomType == rsd.RoomType
        );
        var roomReservations = reservations
            .GroupBy(r => r.RoomId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(r => new
                {
                    CheckInDate = r.CheckInDate,
                    CheckOutDate = r.CheckOutDate
                }).OrderBy(i => i.CheckInDate).ToList()
            );

        var unavailablerooms = new List<int>();

        foreach (var keyValuePair in roomReservations)
        {
            int roomId = keyValuePair.Key;
            var intervals = keyValuePair.Value;
            Console.WriteLine("#############");
            Console.WriteLine(rsd.CheckInDate);
            Console.WriteLine(intervals[0].CheckOutDate);
            Console.WriteLine("#############");

            bool canFit = false;

            // Case A: before first reservation
            if (rsd.CheckOutDate <= intervals[0].CheckInDate)
            {
                canFit = true;
            }

            // Case B: after last reservation
            if (!canFit && rsd.CheckInDate >= intervals.Last().CheckOutDate)
            {
                canFit = true;
            }
            // Case C: between reservations
            for (int j = 0; j < intervals.Count - 1 && !canFit; j++)
            {
                var current = intervals[j];
                var next = intervals[j + 1];

                if (rsd.CheckInDate >= current.CheckOutDate && rsd.CheckOutDate <= next.CheckInDate)
                {
                    canFit = true;
                }
            }



            if (!canFit)
            {
                var room = _unitOfWork.Rooms.Get(r => r.Id == roomId);

                if (room != null)
                {
                    unavailablerooms.Add(room.Id);

                }
            }
        }

        var availableRooms = _unitOfWork.Rooms.GetAll(u => u.RoomType == rsd.RoomType && !unavailablerooms.Contains(u.Id));
        if (!availableRooms.Any())
        {
            return NotFound("No available rooms match your search.");
        }

        return Ok(availableRooms);
    }


    [HttpGet]
    public IActionResult SearchByName([FromBody] GuestName Name)
    {
        if (string.IsNullOrEmpty(Name.Name))
        {
            return NotFound("Invalid search parameters. Please provide a valid name.");
        }
        var Customer_with_this_name = _unitOfWork.Customers.GetAll(r => r.Name == Name.Name).Select(r => r.Id);
        var IsAvailable = _unitOfWork.Reservations.GetAll(r => Customer_with_this_name.Contains(r.CustomerId));
        if (IsAvailable == null || !IsAvailable.Any())
        {
            return NotFound("No customer found with this name.");
        }
        return Ok(IsAvailable);
    }
    private static readonly SemaphoreSlim _reservationLock = new SemaphoreSlim(1, 1);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Reservation reservation)
    {
        if (reservation == null)
        {
            return BadRequest("Reservation data is required.");
        }

        if (reservation.CheckInDate >= reservation.CheckOutDate)
        {
            return BadRequest("Check-in date must be before Check-out date.");
        }

        // try to acquire lock (wait up to 2 seconds, tweak if needed)
        if (!await _reservationLock.WaitAsync(TimeSpan.FromSeconds(2)))
        {
            return StatusCode(429, "Too many requests. Please wait and try again."); // 429 = Too Many Requests
        }

        try
        {
            // Fetch all reservations for this room
            var reservations = _unitOfWork.Reservations.GetAll(r => r.RoomId == reservation.RoomId)
                                                       .OrderBy(r => r.CheckInDate)
                                                       .ToList();

            // If no existing reservations, room is free
            if (!reservations.Any())
            {
                var room = _unitOfWork.Rooms.Get(r => r.Id == reservation.RoomId);
                reservation.Dues = room.Price - reservation.Paid;
                if (ModelState.IsValid)
                {
                    _unitOfWork.Reservations.Create(reservation);
                    _unitOfWork.Save();
                    return Ok("Reservation created successfully.");
                }
                return BadRequest("Invalid reservation data.");
            }

            bool canFit = false;

            // Case A: before first reservation
            if (reservation.CheckOutDate <= reservations.First().CheckInDate)
            {
                canFit = true;
            }

            // Case B: after last reservation
            if (!canFit && reservation.CheckInDate >= reservations.Last().CheckOutDate)
            {
                canFit = true;
            }

            // Case C: between reservations
            for (int i = 0; i < reservations.Count - 1 && !canFit; i++)
            {
                var current = reservations[i];
                var next = reservations[i + 1];

                if (reservation.CheckInDate >= current.CheckOutDate &&
                    reservation.CheckOutDate <= next.CheckInDate)
                {
                    canFit = true;
                }
            }

            if (!canFit)
            {
                return BadRequest("Room is already booked in this interval.");
            }

            // Save new reservation
            if (ModelState.IsValid)
            {
                _unitOfWork.Reservations.Create(reservation);
                _unitOfWork.Save();
                return Ok("Reservation created successfully.");
            }

            return BadRequest("Invalid reservation data. Please check the input and try again.");
        }
        finally
        {
            _reservationLock.Release();
        }
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

    [HttpGet]
    public IActionResult Get(int id)
    {

        var reservation = _unitOfWork.Reservations.Get(u => u.Id == id);
        if (reservation == null) { return BadRequest(); }
        return Ok(reservation);

    }
}


