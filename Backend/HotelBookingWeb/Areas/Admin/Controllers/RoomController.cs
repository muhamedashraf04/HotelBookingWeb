using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using HotelBooking.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using System.Net;
using System.Security.Claims;
using static System.Net.Mime.MediaTypeNames;

namespace HotelBookingWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Route("Admin/[controller]/[action]")]
    public class RoomController : Controller
    {
        private readonly ILogger<RoomController> _logger;
        private IUnitOfWork _unitOfWork;
        private Cloudinary _cloudinary;

        public RoomController(ILogger<RoomController> logger, IUnitOfWork unitOfWork, Cloudinary cloudinary)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _cloudinary = cloudinary;

        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult Upsert([FromForm] Room room, List<IFormFile> uploadedFiles, [FromForm] string? deletedImages)
        {
            var folderPath = $"hotel_booking/rooms/{room.RoomNumber}";
            var uploadedUrls = new List<string>();

            if (!string.IsNullOrEmpty(deletedImages))
            {
                var urlsToDelete = System.Text.Json.JsonSerializer.Deserialize<List<string>>(deletedImages);

                if (urlsToDelete != null && urlsToDelete.Any())
                {
                    var publicIds = new List<string>();

                    foreach (var url in urlsToDelete)
                    {
                        var uri = new Uri(url);
                        var segments = uri.AbsolutePath.Split('/');

                        var startIndex = Array.IndexOf(segments, "hotel_booking");
                        if (startIndex != -1)
                        {
                            var publicId = string.Join("/", segments.Skip(startIndex));
                            publicId = Path.Combine(
                                Path.GetDirectoryName(publicId) ?? string.Empty,
                                Path.GetFileNameWithoutExtension(publicId)
                            ).Replace("\\", "/");

                            publicIds.Add(publicId);
                        }
                    }

                    if (publicIds.Count > 0)
                    {
                        var deletionResult = _cloudinary.DeleteResources(publicIds.ToArray());
                        if (deletionResult.StatusCode != System.Net.HttpStatusCode.OK)
                        {
                            return BadRequest("Failed to delete some images.");
                        }
                    }
                }
            }
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
            room.Images = ro.GetImagesFromFolder(folderPath);

            string RoomType = room.RoomType;


            if (ModelState.IsValid)
            {
                var _room = _unitOfWork.Rooms.Get(u => u.Id == room.Id);

                if (_room == null)
                {

                    _room = new Room
                    {
                        Floor = room.Floor,
                        RoomNumber = room.RoomNumber,
                        Capacity = room.Capacity,
                        IsAvailable = room.IsAvailable,
                        RoomType = room.RoomType,
                        Images = room.Images,
                        Price = _unitOfWork.Rates.Get(u => u.Type == room.RoomType).Price,
                        updatedBy = User.Identity?.Name,
                        createdBy = User.Identity?.Name
                    };

                    _unitOfWork.Rooms.Create(_room);
                }
                else
                {
                    var rate = _unitOfWork.Rates.Get(u => u.Type == room.RoomType);
                    // Common property mapping
                    _room.IsAvailable = room.IsAvailable;
                    _room.Capacity = room.Capacity;
                    _room.Floor = room.Floor;
                    _room.RoomNumber = room.RoomNumber;
                    _room.RoomType = room.RoomType;
                    _room.Images = room.Images;
                    _room.updatedBy = User.Identity?.Name;
                    _room.Price = rate == null ? 0 : rate.Price;

                    _unitOfWork.Rooms.Edit(_room);
                }
                _unitOfWork.Save();
                return Ok();
            }
            return BadRequest();
        }
        public IActionResult GetAll()
        {
            var rooms = _unitOfWork.Rooms.GetAll();
            return Ok(rooms.ToList());
        }
        [HttpGet]
        public IActionResult GetRoom(int id)
        {

            var room = _unitOfWork.Rooms.Get(u => u.Id == id);
            if (room == null) { return BadRequest(); }
            return Ok(room);

        }
        [HttpDelete]
        public IActionResult Remove(int? Id)
        {
            if (Id == null)
            {
                return BadRequest();
            }
            else
            {
                var reservation = _unitOfWork.Reservations.Get(u => u.RoomId == Id);
                if ( reservation != null)
                {
                    return BadRequest("Can't Delete Room because there is a reservation");
                }
                var room = _unitOfWork.Rooms.Get(u => u.Id == Id);
                var prefix = $"hotel_booking/rooms/{room.RoomNumber}/";
                _cloudinary.DeleteResourcesByPrefix(prefix);
                var res = _unitOfWork.Reservations.Get(u => u.Id == Id);
                if (res != null)
                { 
                    return BadRequest("Room is in Reservation");
                }
                _unitOfWork.Rooms.Remove(Id.Value);
                _unitOfWork.Save();

                return Ok();
            }
        }



    }
}

