
using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.HotelBooking.DataAccess.Repositories;
using HotelBooking.DataAccess.Repositories.Interfaces;

namespace HotelBooking.DataAccess.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        public ICustomerRepository Customers { get; set; }

        public IReservationRepository Reservations { get; set; }
     
        public IRoomRepository Rooms { get; set; }

        public IUserRepository Users { get; set; }

        public IAdminRepository Admins { get; set; }

        public IRateRepository Rates { get; set; }
        public IConfigutaionRepository Configurations { get; set; }


        public ApplicationDBContext DbContext { get; set; } 
        public UnitOfWork(ApplicationDBContext dBContext)
        {
            DbContext = dBContext;
            Reservations = new ReservationRepository(DbContext);
            Customers = new CustomerRepository(DbContext);
            Admins = new AdminRepository(DbContext);
            Users = new UserRepository(DbContext);
            Rooms = new RoomRepository(DbContext);
            Rates = new RateRepository(DbContext);
            Configurations = new ConfigurationRepository(DbContext);
        }
        public void Save()
        {
            DbContext.SaveChanges();
        }

        public async Task<bool> SaveAsync()
        {
            await DbContext.SaveChangesAsync();
            return true;
        }


    }
}
