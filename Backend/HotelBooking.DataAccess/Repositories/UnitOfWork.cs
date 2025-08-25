using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.HotelBooking.DataAccess.Repositories;
using HotelBooking.DataAccess.Repositories.Interfaces;

namespace HotelBooking.DataAccess.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        public ICustomerRepository Customers { get; set; }

        public IReservationRepository Reservations { get; set; }
        public ISingleRoomRepository SingleRooms { get; set; }
        public IDoubleRoomRepository DoubleRooms { get; set; }
        public ISuiteRepository Suites { get; set; }

        public IUserRepository Users { get; set; }

        public IAdminRepository Admins { get; set; }

        private ApplicationDBContext _DBContext;
        public UnitOfWork(ApplicationDBContext dBContext)
        {
            _DBContext = dBContext;
            Reservations = new ReservationRepository(_DBContext);
            Customers = new CustomerRepository(_DBContext);
            SingleRooms= new SingleRoomRepository(_DBContext);
            DoubleRooms = new DoubleRoomRepository(_DBContext);
            Suites = new SuiteRepository(_DBContext);
            Admins = new AdminRepository(_DBContext);
            Users = new UserRepository(_DBContext);
        }
        public void Save()
        {
            _DBContext.SaveChanges();
        }


    }
}
