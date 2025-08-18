using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.Interfaces;

namespace HotelBooking.DataAccess.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        public ICustomerRepository Customers { get; set; }

        public IReservationRepository Reservations { get; set; }

        private ApplicationDBContext _DBContext;
        public UnitOfWork(ApplicationDBContext dBContext)
        {
            _DBContext = dBContext;
            Reservations = new ReservationRepository(_DBContext);
            Customers = new CustomerRepository(_DBContext);
        }
        public void Save()
        {
            _DBContext.SaveChanges();
        }
    }
}
