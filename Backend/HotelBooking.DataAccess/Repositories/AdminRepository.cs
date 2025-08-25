using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Auth;

namespace HotelBooking.DataAccess.Repositories
{
    namespace HotelBooking.DataAccess.Repositories
    {
        public class AdminRepository : BaseRepository<Admin>, IAdminRepository
        {
            ApplicationDBContext _dbContext;
            public AdminRepository(ApplicationDBContext dBContext) : base(dBContext)
            {
                _dbContext = dBContext;
            }
        }
    }
}
