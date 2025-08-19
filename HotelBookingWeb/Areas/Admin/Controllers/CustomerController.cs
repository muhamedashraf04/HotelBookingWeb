using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.DTOs;
using HotelBooking.Models.Models;
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

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Register([FromForm] RegisterCustomerDTO registerCustomerDTO)
    {
        Customer? customer = registerCustomerDTO.customer;
        IFormFile? IDFile = registerCustomerDTO.IdentificationFile;
        
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);

        }
        if (IDFile != null)
        {
            using var stream = IDFile.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(IDFile.FileName, stream),
                Folder = "hotel_booking/customers"
            };

            var uploadResult = _cloudinary.Upload(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                var url = uploadResult.SecureUrl.ToString();
                customer.IdentificationAttachment = url;
                var today = DateOnly.FromDateTime(DateTime.Now);
                customer.Age = today.Year - customer.BirthDate.Year; _unitOfWork.Customers.Create(customer);
                _unitOfWork.Save();
                return Ok("Customer Registered Successfully");

            }
            else
            {
                if (uploadResult.Error != null)
                    return BadRequest($"Upload failed: {uploadResult.Error.Message}");
                return BadRequest("Failed To Upload Image");
            }

        }
        return Ok("Customer Registered Successfully Without ID Attachment");

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
            return BadRequest("Id is required.");

        var removed = _unitOfWork.Customers.Remove(id.Value);

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
}
