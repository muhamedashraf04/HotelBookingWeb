using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace HotelBookingWeb.Areas.Guest.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private IUnitOfWork _unitOfWork;

        public HomeController(ILogger<HomeController> logger, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }
        
        public IActionResult Index()
        {
            foreach (var customer in _unitOfWork.Customers.GetAll())
            {
                Console.WriteLine("Name : "+customer.Name);
                Console.WriteLine("ID : "+customer.Id);

            }
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

    }
}
