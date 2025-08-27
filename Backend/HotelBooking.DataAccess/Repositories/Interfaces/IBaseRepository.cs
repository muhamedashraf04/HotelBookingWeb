using HotelBooking.Models.Models;
using System.Linq.Expressions;

namespace HotelBooking.DataAccess.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        public T Get(Expression<Func<T, bool>> Filter, string? IncludeProperties = null);
        IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null, string? IncludeProperties = null);
        public void Create<T>(T obj) where T : BaseEntity;

        public bool Remove(int id);
        public void Edit<T>(T Obj) where T : BaseEntity;
        public Task<T?> GetAsync(Expression<Func<T, bool>> filter);

        public Task<IEnumerable<T>> GetAllAsync();

    }
}
