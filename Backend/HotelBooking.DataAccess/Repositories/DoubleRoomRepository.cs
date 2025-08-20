using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.RoomModels;
namespace HotelBooking.DataAccess.Repositories
{
    public class DoubleRoomRepository : BaseRepository<DoubleRoom>, IDoubleRoomRepository
    {
        ApplicationDBContext _dbContext;
        public DoubleRoomRepository(ApplicationDBContext dBContext) : base(dBContext)
        {
            _dbContext = dBContext;
        }
    }
}
