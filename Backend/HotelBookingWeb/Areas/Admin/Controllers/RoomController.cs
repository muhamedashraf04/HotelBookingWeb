using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using Microsoft.AspNetCore.Mvc;
using System.Net;

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
        public string GetImagesFromFolder(string folderPath)
        {
            // Normalize: remove leading/trailing slashes, use forward slashes, add exactly one trailing slash
            var prefix = string.IsNullOrWhiteSpace(folderPath)
                ? ""
                : folderPath.Replace("\\", "/").Trim('/') + "/";

            var urls = new List<string>();

            var listParams = new ListResourcesByPrefixParams
            {
                Prefix = prefix,
                ResourceType = ResourceType.Image, // Only images
                Type = "upload",
                MaxResults = 500
            };

            ListResourcesResult result;
            do
            {
                result = _cloudinary.ListResources(listParams);

                if (result?.Resources != null)
                    urls.AddRange(result.Resources.Select(r => r.SecureUrl.ToString()));

                listParams.NextCursor = result?.NextCursor;
            }
            while (!string.IsNullOrEmpty(listParams.NextCursor));

            return string.Join(",", urls);
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

            // --- Handle Uploads ---
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

            room.Images = GetImagesFromFolder(folderPath);

            // ---- Now proceed with Room insert/update logic ----
            string RoomType = room.RoomType;


            if (ModelState.IsValid)
            {
                if (RoomType == "Single")
                {
                    var singleRoom = _unitOfWork.SingleRooms.Get(u => u.Id == room.Id);

                    if (singleRoom == null) // new room
                    {
                        
                        singleRoom = new SingleRoom
                        {
                            Floor = room.Floor,
                            RoomNumber = room.RoomNumber,
                            Capacity = room.Capacity,
                            IsAvailable = room.IsAvailable,
                            RoomType = room.RoomType,
                            Images = room.Images
                        };
                        _unitOfWork.SingleRooms.Create(singleRoom);
                    }
                    else
                    {
                        // Common property mapping
                        singleRoom.IsAvailable = room.IsAvailable;
                        singleRoom.Capacity = room.Capacity;
                        singleRoom.Floor = room.Floor;
                        singleRoom.RoomNumber = room.RoomNumber;
                        singleRoom.RoomType = room.RoomType;
                        singleRoom.Images = room.Images;

                        // If editing, EF is already tracking it since we fetched it
                        _unitOfWork.SingleRooms.Edit(singleRoom);
                    }
                    _unitOfWork.Save();
                    return Ok();
                }
                if (RoomType == "Double")
                {
                    var doubleroom = _unitOfWork.DoubleRooms.Get(u => u.Id == room.Id);

                    if (doubleroom == null) // new room
                    {
                        doubleroom = new DoubleRoom
                        {
                            Floor = room.Floor,
                            RoomNumber = room.RoomNumber,
                            Capacity = room.Capacity,
                            IsAvailable = room.IsAvailable,
                            RoomType = room.RoomType,
                            Images = room.Images
                        };
                        _unitOfWork.DoubleRooms.Create(doubleroom);
                    }
                    else
                    {
                        // Common property mapping
                        doubleroom.IsAvailable = room.IsAvailable;
                        doubleroom.Capacity = room.Capacity;
                        doubleroom.Floor = room.Floor;
                        doubleroom.RoomNumber = room.RoomNumber;
                        doubleroom.RoomType = room.RoomType;
                        doubleroom.Images = room.Images;

                        // If editing, EF is already tracking it since we fetched it
                        _unitOfWork.DoubleRooms.Edit(doubleroom);
                    }
                    _unitOfWork.Save();
                    return Ok();
                }
                if (RoomType == "Suite")
                {
                    var suite = _unitOfWork.Suites.Get(u => u.Id == room.Id);

                    if (suite == null) // new room
                    {
                        suite = new Suite
                        {
                            Floor = room.Floor,
                            RoomNumber = room.RoomNumber,
                            Capacity = room.Capacity,
                            IsAvailable = room.IsAvailable,
                            RoomType = room.RoomType,
                            Images = room.Images
                        };
                        _unitOfWork.Suites.Create(suite);
                    }
                    else
                    {
                        // Common property mapping
                        suite.IsAvailable = room.IsAvailable;
                        suite.Capacity = room.Capacity;
                        suite.Floor = room.Floor;
                        suite.RoomNumber = room.RoomNumber;
                        suite.RoomType = room.RoomType;
                        suite.Images = room.Images;

                        // If editing, EF is already tracking it since we fetched it
                        _unitOfWork.Suites.Edit(suite);
                    }
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
        [HttpGet]
        public IActionResult GetRoom(int id, string type)
        {
            if (type == "Single")
            {
                var room =_unitOfWork.SingleRooms.Get(u=>u.Id == id);
                if (room == null) {return BadRequest();}
                return Ok(new
                {
                    room.Id,
                    room.RoomNumber,
                    room.Capacity,
                    room.IsAvailable,
                    room.RoomType,
                    room.Floor,
                    room.Images
                });
            }
            if (type == "Double")
            {
                var room = _unitOfWork.DoubleRooms.Get(u => u.Id == id);
                if (room == null) { return BadRequest(); }
                var imageList = room.Images?.Split(',').ToList() ?? new List<string>();
                return Ok(new
                {
                    room.Id,
                    room.RoomNumber,
                    room.Capacity,
                    room.IsAvailable,
                    room.RoomType,
                    room.Floor,
                    room.Images
                });
            }
            if (type == "Suite")
            {
                var room = _unitOfWork.Suites.Get(u => u.Id == id);
                if (room == null) { return BadRequest(); }
                var imageList = room.Images?.Split(',').ToList() ?? new List<string>();
                return Ok(new
                {
                    room.Id,
                    room.RoomNumber,
                    room.Capacity,
                    room.IsAvailable,
                    room.RoomType,
                    room.Floor,
                    room.Images
                });
            }
            else
            {
                return BadRequest();
            }
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
                    var room = _unitOfWork.SingleRooms.Get(u=>u.Id == Id);
                    _cloudinary.DeleteFolder($"hotel_booking/rooms/{room.RoomNumber}");
                    _unitOfWork.SingleRooms.Remove(Id.Value);
                }
                if (RoomType == "Double")
                {
                    var room = _unitOfWork.DoubleRooms.Get(u => u.Id == Id);
                    _cloudinary.DeleteFolder($"hotel_booking/rooms/{room.RoomNumber}");
                    _unitOfWork.DoubleRooms.Remove(Id.Value);
                }
                if (RoomType == "Suite")
                {
                    var room = _unitOfWork.Suites.Get(u => u.Id == Id);
                    _cloudinary.DeleteFolder($"hotel_booking/rooms/{room.RoomNumber}");
                    _unitOfWork.Suites.Remove(Id.Value);
                }
                _unitOfWork.Save();
                return Ok();
            }

        }
    }
}
