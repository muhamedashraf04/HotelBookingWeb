using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTOs;
using HotelBooking.Models.Models;
using HotelBooking.Utilities;
using Microsoft.AspNetCore.Mvc;
using HotelBooking.Models.RoomModels;
namespace HotelBookingWeb.Areas.Admin.Controllers;

[Area("Admin")]
[Route("Admin/[controller]/[action]")]
public class CheckinController : Controller
{
    private readonly ILogger<CheckinController> _logger;
    private IUnitOfWork _unitOfWork;
    private Cloudinary _cloudinary;
    public CheckinController(ILogger<CheckinController> logger, IUnitOfWork unitOfWork, Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }
    [HttpGet]
    public IActionResult GetToday()
    {
        var today = DateTime.Today;

        var reservations = _unitOfWork.Reservations.GetAll(
            u => u.CheckInDate.Date == today
        );

        if (reservations == null || !reservations.Any())
        {
            return NotFound("No reservations found for today.");
        }

        return Ok(reservations);
    }
    [HttpDelete]
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
            return NotFound("Object not fou nd.");
        }
    }


    [HttpPatch]
    
    public IActionResult In( [FromForm]CheckInDTO inDTO, [FromForm] List<IFormFile>? uploadedFiles)
    {
        var reservation = null as Reservation;
        var room = null as Room;
        if (inDTO == null)
        {
            return BadRequest("Reservation data is required.");
        }

        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        if (uploadedFiles != null && uploadedFiles.Count > 0)
        {
            foreach (var file in uploadedFiles)
            {
                if (file.Length == 0)
                {
                    return BadRequest("One of the uploaded files is empty.");
                }

                if (!allowedContentTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest($"File type {file.ContentType} is not allowed. Only image files are accepted.");
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest($"File extension {extension} is not allowed. Only image files are accepted.");
                }
            }
        }
        reservation = _unitOfWork.Reservations.Get(u => u.Id == inDTO.ReservationId);
            room = _unitOfWork.Rooms.Get(u => u.Id == reservation.RoomId);
            if (reservation == null)
            {
                return BadRequest("Reservation could not be found.");

            }
            if ( reservation.Status == "Checked-In")
            {
                return BadRequest("User Already Checked-In.");
            }
        

        var folderPath = $"hotel_booking/Reservations/{reservation.Id}";
        var uploadedUrls = new List<string>();

        if (uploadedFiles != null && uploadedFiles.Count > 0)
        {
            foreach (var file in uploadedFiles)
            {
                using var stream = file.OpenReadStream();
                var uploadResult = _cloudinary.Upload(new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folderPath
                });

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    uploadedUrls.Add(uploadResult.SecureUrl.ToString());
                }
            }
        }
        var ro = new ImageUtility(_cloudinary);

        float numberOfNights = (reservation.CheckOutDate.Date - reservation.CheckInDate.Date).Days ;
        float totalCost = room.Price * numberOfNights;
        reservation.ProofOfPayment = ro.GetImagesFromFolder(folderPath);
        reservation.Status = "Checked-In";

        Console.WriteLine("NEW COST");
        Console.WriteLine(totalCost);
        Console.WriteLine("NEW PAID");
        Console.WriteLine(inDTO.Paid);
        Console.WriteLine("NEW DISCOUNT");
        Console.WriteLine(inDTO.Discount);
        Console.WriteLine("NEW DUES");
        Console.WriteLine(reservation.Dues - inDTO.Paid - inDTO.Discount);
        reservation.Paid += inDTO.Paid;
        reservation.Discount = inDTO.Discount;
        reservation.Dues = reservation.Dues - reservation.Paid - inDTO.Discount;

        var customer = _unitOfWork.Customers.Get(u => u.Id == reservation.CustomerId);
        customer.status = reservation.Status;
        _unitOfWork.Reservations.Edit(reservation);
        _unitOfWork.Customers.Edit(customer);
        _unitOfWork.Save();
        return Ok("Checked-In Successfully.");


    }

}





