using System.Linq.Expressions;

namespace HotelBooking.DataAccess.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        public T Get(Expression<Func<T, bool>> Filter, string? IncludeProperties = null);
        IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null, string? IncludeProperties = null);
        public void Create(T obj);

        public bool Remove(int id);
        public void Edit(T Obj);
    }
}
