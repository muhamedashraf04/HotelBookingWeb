using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repos;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
namespace HotelBooking.DataAccess.Repositories
{
    public class ConfigurationRepository : BaseRepository<Configuration>, IConfigutaionRepository
    {
        ApplicationDBContext _dbContext;
        public ConfigurationRepository(ApplicationDBContext dBContext) : base(dBContext)
        {
            _dbContext = dBContext;
        }
    }
}
