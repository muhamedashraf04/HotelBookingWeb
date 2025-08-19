using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Mvc;

[Area("Admin")]
[Route("Admin/[controller]/[action]")]
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
            var today = DateOnly.FromDateTime(DateTime.Now);
            customer.Age = today.Year - customer.BirthDate.Year; _unitOfWork.Customers.Create(customer);
            _unitOfWork.Save();
            return Ok("Customer Registered Successfully");
        }
        else
        {
            return BadRequest(ModelState);
        }
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
