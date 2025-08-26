
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

        private ApplicationDBContext _DBContext;
        public UnitOfWork(ApplicationDBContext dBContext)
        {
            _DBContext = dBContext;
            Reservations = new ReservationRepository(_DBContext);
            Customers = new CustomerRepository(_DBContext);
            Admins = new AdminRepository(_DBContext);
            Users = new UserRepository(_DBContext);
            Rooms = new RoomRepository(_DBContext);
        }
        public void Save()
        {
            _DBContext.SaveChanges();
        }


    }
}
