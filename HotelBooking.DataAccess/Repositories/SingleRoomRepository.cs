using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;

namespace HotelBooking.DataAccess.Repositories
{
    public class SingleRoomRepository : BaseRepository<SingleRoom>, ISingleRoomRepository
    {
        ApplicationDBContext _dbContext;
        public SingleRoomRepository(ApplicationDBContext dBContext) : base(dBContext)
        {
            _dbContext = dBContext;
        }
    }
}
