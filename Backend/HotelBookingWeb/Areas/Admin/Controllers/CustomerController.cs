using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTOs;
using HotelBooking.Models.Models;
using HotelBooking.Utilities;
using Microsoft.AspNetCore.Mvc;

[Area("Admin")]
[Route("Admin/[controller]/[action]")]
public class CustomerController : Controller
{
    private readonly ILogger<CustomerController> _logger;
    private IUnitOfWork _unitOfWork;
    private Cloudinary _cloudinary;

    public CustomerController(ILogger<CustomerController> logger, IUnitOfWork unitOfWork, Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }


    [HttpPost]
    public IActionResult Register([FromForm] RegisterCustomerDTO registerCustomerDTO)
    {
        Customer? customer = registerCustomerDTO.customer;
        var folderPath = $"hotel_booking/Customers/{customer.Name}|{customer.IdentificationNumber}";
        List<IFormFile>? IDFile = registerCustomerDTO.IdentificationFile;
        List<IFormFile>? MarriageCertificateFile = registerCustomerDTO.MarriageCertificate;
        var cust = new ImageUtility(_cloudinary);
        if (!ModelState.IsValid)
        {
            Console.WriteLine(ModelState);
            return BadRequest("Error happened during creation, Revise form data and try again");
        }

        if (IDFile != null)
        {
            Console.WriteLine("ALOOOOOOOOOO");


            //Allowed Types
            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

            if (IDFile.Count > 0)
            {
                foreach (var file in IDFile)
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
                    else
                    {
                        using var stream = file.OpenReadStream();
                        var uploadResult = _cloudinary.Upload(new ImageUploadParams
                        {
                            File = new FileDescription(file.FileName, stream),
                            Folder = folderPath + "/ID"
                        });

                    }
                }
                customer.IdentificationAttachment = cust.GetImagesFromFolder(folderPath + "/ID");
            }
            if (MarriageCertificateFile != null && MarriageCertificateFile.Count > 0)
            {
                foreach (var file in MarriageCertificateFile)
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

                    else
                    {
                        using var stream = file.OpenReadStream();
                        var uploadResult = _cloudinary.Upload(new ImageUploadParams
                        {
                            File = new FileDescription(file.FileName, stream),
                            Folder = folderPath + "/MarriageCert"
                        });

                    }
                }
                customer.MarriageCertificateAttachment = cust.GetImagesFromFolder(folderPath + "/MarriageCert");
            }
        }

        var today = DateOnly.FromDateTime(DateTime.Now);
        var age = today.Year - customer.BirthDate.Year;
        if (today < customer.BirthDate.AddYears(age))
        { age--; }
        customer.Age = age;

        _unitOfWork.Customers.Create(customer);
        _unitOfWork.Save();

        return Ok("All Done Ya Kbeer");
    }
    [HttpPost]
    public IActionResult Edit([FromForm] RegisterCustomerDTO registerCustomerDTO)
    {
        Customer? customer = _unitOfWork.Customers.Get(u => u.Id == registerCustomerDTO.customer.Id);
        if (customer == null)
        {
            return NotFound("No Customer Exists");
        }
        if (customer != null)
        {
            customer.Name = registerCustomerDTO.customer.Name;
            customer.PhoneNumber = registerCustomerDTO.customer.PhoneNumber;
            customer.Address = registerCustomerDTO.customer.Address;
            customer.Age = registerCustomerDTO.customer.Age;
            customer.updatedAt = DateTime.Now;
            customer.Email = registerCustomerDTO.customer.Email;
            customer.BirthDate = registerCustomerDTO.customer.BirthDate;
            customer.IdentificationNumber = registerCustomerDTO.customer.IdentificationNumber;
            customer.IsMarried = registerCustomerDTO.customer.IsMarried;
            customer.Nationality = registerCustomerDTO.customer.Nationality;
            customer.IdentificationType = registerCustomerDTO.customer.IdentificationType;
        }

        List<IFormFile>? IDFile = registerCustomerDTO.IdentificationFile;
        List<IFormFile>? MarriageCertificateFile = registerCustomerDTO.MarriageCertificate;
        string? deleted = registerCustomerDTO.deletedImages;
        var cust = new ImageUtility(_cloudinary);
        var folderPath = $"hotel_booking/Customers/{customer.Name}|{customer.IdentificationNumber}";
        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        if (!ModelState.IsValid)
        {
            Console.WriteLine(ModelState);
            return BadRequest("Error happened during Updating, Revise form data and try again");
        }
        if (customer.IsMarried == false)
        {
            var prefix = $"hotel_booking/Customers/{customer.Name}/";
            _cloudinary.DeleteResourcesByPrefix(prefix + "MarriageCert");
            customer.MarriageCertificateAttachment = null;
        }
        if (IDFile != null && IDFile.Count > 0)
        {
            //Allowed Types


            foreach (var file in IDFile)
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
                else
                {
                    using var stream = file.OpenReadStream();
                    var uploadResult = _cloudinary.Upload(new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = folderPath + "/ID"
                    });
                }
            }
            customer.IdentificationAttachment = cust.GetImagesFromFolder(folderPath + "/ID");
        }
        if (MarriageCertificateFile != null && MarriageCertificateFile.Count > 0)
        {
            foreach (var file in MarriageCertificateFile)
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

                else
                {
                    using var stream = file.OpenReadStream();
                    var uploadResult = _cloudinary.Upload(new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = folderPath + "/MarriageCert"
                    });
                }
            }
            customer.MarriageCertificateAttachment = cust.GetImagesFromFolder(folderPath + "/MarriageCert");

        }
        if (!string.IsNullOrEmpty(deleted))
        {
            var urlsToDelete = System.Text.Json.JsonSerializer.Deserialize<List<string>>(deleted);

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
            customer.IdentificationAttachment = cust.GetImagesFromFolder(folderPath + "/ID");
            customer.MarriageCertificateAttachment = cust.GetImagesFromFolder(folderPath + "/MarriageCert");
        }

        var today = DateOnly.FromDateTime(DateTime.Now);
        var age = today.Year - customer.BirthDate.Year;
        if (today < customer.BirthDate.AddYears(age))
        { age--; }
        customer.Age = age;

        _unitOfWork.Customers.Edit(customer);
        _unitOfWork.Save();

        return Ok("OKAAAY");
    }

    [HttpGet]
    public IActionResult GetCustomers()
    {
        IList<Customer> customers = _unitOfWork.Customers.GetAll().ToList();
        return Ok(customers);
    }

    [HttpDelete("{id}")]
    public IActionResult Remove(int? id)
    {
        if (id == null)
        {
            return BadRequest("Id is required.");
        }

        var reservation = _unitOfWork.Reservations.Get(u => u.CustomerId == id);
        if (reservation != null)
        {
            return BadRequest("Can't delete customer because there is a reservation");
        }

        var cust = _unitOfWork.Customers.Get(u => u.Id == id);
        var prefix = $"hotel_booking/Customers/{cust.Name}|{cust.IdentificationNumber}/";
        _cloudinary.DeleteResourcesByPrefix(prefix + "ID");
        _cloudinary.DeleteResourcesByPrefix(prefix + "MarriageCert");



        var removed = _unitOfWork.Customers.Remove(id.Value);
        if (removed)
        {
            _unitOfWork.Save();
            return Ok("Customer removed successfully.");
        }
        else
        {
            return BadRequest("Customer not found");
        }
    }
    [HttpGet]
    public IActionResult Get(int id)
    {
        var customer = _unitOfWork.Customers.Get(c => c.Id == id);
        if (customer == null)
        {
            return NotFound("Customer not found.");
        }
        return Ok(customer);
    }

}
