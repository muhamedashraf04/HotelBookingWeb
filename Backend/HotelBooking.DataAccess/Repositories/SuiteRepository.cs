using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;

namespace HotelBooking.DataAccess.Repositories
{
    public class SuiteRepository : BaseRepository<Suite>, ISuiteRepository
    {
        ApplicationDBContext _dbContext;
        public SuiteRepository(ApplicationDBContext dBContext) : base(dBContext)
        {
            _dbContext = dBContext;
        }
    }
}
