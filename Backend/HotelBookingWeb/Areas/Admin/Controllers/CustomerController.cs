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

    
    [HttpPost]
    public IActionResult Register([FromForm] RegisterCustomerDTO registerCustomerDTO)
    {
        Customer? customer = registerCustomerDTO.customer;
        IFormFile? IDFile = registerCustomerDTO.IdentificationFile;
        IFormFile? MarriageCertificateFile = registerCustomerDTO.MarriageCertificate;

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        string message = "Customer Registered Successfully";
        
        if (IDFile != null)
        {
            using var stream = IDFile.OpenReadStream();
            var uploadResult = _cloudinary.Upload(new ImageUploadParams
            {
                File = new FileDescription(IDFile.FileName, stream),
                Folder = "hotel_booking/customers"
            });

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                customer.IdentificationAttachment = uploadResult.SecureUrl.ToString();
            }
            else
            {
                message += " | Failed to upload ID file";
            }
        }
        else
        {
            message += " | ID Missing";
        }

        if (customer.IsMarried)
        {
            if (MarriageCertificateFile != null)
            {
                using var stream = MarriageCertificateFile.OpenReadStream();
                var uploadResult = _cloudinary.Upload(new ImageUploadParams
                {
                    File = new FileDescription(MarriageCertificateFile.FileName, stream),
                    Folder = "hotel_booking/customers/marriage_certificates"
                });

                if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    customer.MarriageCertificateAttachment = uploadResult.SecureUrl.ToString();
                }
                else
                {
                    message += " | Failed to upload Marriage Certificate";
                }
            }
            else
            {
                message += " | Marriage Certificate Missing";
            }
        }

        customer.Age = DateOnly.FromDateTime(DateTime.Now).Year - customer.BirthDate.Year;
        _unitOfWork.Customers.Create(customer);
        _unitOfWork.Save();

        return Ok(message);
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
