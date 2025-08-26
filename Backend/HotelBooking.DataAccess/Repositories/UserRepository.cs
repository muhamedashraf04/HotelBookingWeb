using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Auth;

namespace HotelBooking.DataAccess.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        ApplicationDBContext _dbContext;
        public UserRepository(ApplicationDBContext dBContext) : base(dBContext)
        {
            _dbContext = dBContext;
        }
    }
}
