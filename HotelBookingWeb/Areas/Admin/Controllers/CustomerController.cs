using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Mvc;

namespace HotelBookingWeb.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class CustomerController : Controller
    {
        private readonly ILogger<CustomerController> _logger;
        private IUnitOfWork _unitOfWork;

        public CustomerController(ILogger<CustomerController> logger, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Register([FromBody] Customer customer)
        {
            if (ModelState.IsValid)
            {
                _unitOfWork.Customers.Create(customer);
                _unitOfWork.Save();
                return Ok("Customer Registered Successfully");
            }
            else
            {
                // Return actual validation errors
                return BadRequest(ModelState);
            }
        }

    }
}
