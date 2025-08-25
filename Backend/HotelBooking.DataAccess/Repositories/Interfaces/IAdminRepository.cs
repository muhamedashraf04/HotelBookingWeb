using HotelBooking.DataAccess.Repos;
using HotelBooking.Models.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.DataAccess.Repositories.Interfaces
{
    public interface IAdminRepository : IBaseRepository<Admin>
    {
    }
}
