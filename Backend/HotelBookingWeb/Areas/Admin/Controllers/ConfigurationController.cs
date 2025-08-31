using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingWeb.Areas.Admin.Controllers;
[Area("Admin")]
[Route("Admin/[controller]/[action]")]
public class ConfigurationController : Controller
{

    private readonly IUnitOfWork _unitOfWork;
    private Cloudinary _cloudinary;
    public ConfigurationController(IUnitOfWork unitOfWork, Cloudinary cloudinary)
    {
        _unitOfWork = unitOfWork;
        _cloudinary = cloudinary;
    }
    [HttpGet]
    public IActionResult GetImageUrl()
    {
        var image = _unitOfWork.Configurations.GetAll().ToList();
        if (!image.Any())
        {
            return BadRequest("No Images Found");
        }
        return Ok(image[0].IconUrl);

    }
    [HttpPost]
    public IActionResult Upsert(IFormFile uploadedFile)
    {
        if (uploadedFile == null) return BadRequest("No file uploaded");

        var folderPath = "hotel_booking/Configuration/Image";

        using var stream = uploadedFile.OpenReadStream();
        var uploadResult = _cloudinary.Upload(new ImageUploadParams
        {
            File = new FileDescription(uploadedFile.FileName, stream),
            Folder = folderPath
        });

        if (uploadResult.StatusCode != System.Net.HttpStatusCode.OK)
            return BadRequest("Upload failed");

        // remove old config
        var existingConfig = _unitOfWork.Configurations.GetAll().FirstOrDefault();
        if (existingConfig != null)
        {
            _unitOfWork.Configurations.Remove(existingConfig.Id);
        }

        // save new one
        var newConfig = new Configuration { IconUrl = uploadResult.SecureUrl.ToString() };
        _unitOfWork.Configurations.Create(newConfig);
        _unitOfWork.Save();

        return Ok(newConfig.IconUrl);
    }

}

