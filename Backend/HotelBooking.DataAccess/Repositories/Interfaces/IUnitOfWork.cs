using HotelBooking.DataAccess.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBooking.DataAccess.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        ICustomerRepository Customers { get; }
        IReservationRepository Reservations { get; }
        //IOldReservationRespository OldReservations { get; }

        IRoomRepository Rooms { get; }
        IUserRepository Users { get; }
        IRateRepository Rates { get; }
        IAdminRepository Admins { get; }
        IConfigutaionRepository Configurations { get; }
        
        ApplicationDBContext DbContext { get; }
        public void Save();

        public Task<bool> SaveAsync();

    }
}
