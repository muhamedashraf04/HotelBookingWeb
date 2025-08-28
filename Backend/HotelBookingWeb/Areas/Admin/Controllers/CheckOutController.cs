using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
using HotelBooking.Utilities;
using Microsoft.AspNetCore.Mvc;
namespace HotelBookingWeb.Areas.Admin.Controllers;

[Area("Admin")]
[Route("Admin/[controller]/[action]")]
public class CheckOutController : Controller
{
    private readonly ILogger<CheckinController> _logger;
    private IUnitOfWork _unitOfWork;
    private Cloudinary _cloudinary;
    public CheckOutController(ILogger<CheckinController> logger, IUnitOfWork unitOfWork, Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }
    [HttpGet]
    public IActionResult GetCheckOutToday()
    {
        var today = DateTime.Today;

        var reservations = _unitOfWork.Reservations.GetAll(
            u => (u.CheckOutDate.Date == today) && (u.Status == "Checked-In")
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

    public IActionResult Out(int? id, [FromForm] List<IFormFile>? uploadedFiles)
    {
        var reservation = null as Reservation;
        if (id == null)
        {
            return BadRequest("Reservation data is required.");
        }
        else
        {
            reservation = _unitOfWork.Reservations.Get(u => u.Id == id);
            if (reservation == null)
            {
                return BadRequest("Reservation could not be found.");

            }
            if (reservation.Status == "Checked-Out")
            {
                return BadRequest("User Already Checked-Out.");
            }
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
        reservation.ProofOfPayment = ro.GetImagesFromFolder(folderPath);
        reservation.Status = "Checked-Out";
        var customer = _unitOfWork.Customers.Get(u => u.Id == reservation.CustomerId);
        customer.status = reservation.Status;
        _unitOfWork.Reservations.Edit(reservation);
        _unitOfWork.Save();
        return Ok("Checked-In Successfully.");


    }

}





