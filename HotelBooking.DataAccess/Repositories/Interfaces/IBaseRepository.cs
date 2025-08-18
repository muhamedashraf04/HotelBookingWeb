using System.Linq.Expressions;

namespace HotelBooking.DataAccess.Repositories.Interfaces
{
    public interface IBaseRepository<T> where T : class
    {
        public T Get(Expression<Func<T, bool>> Filter, string? IncludeProperties = null);
        IEnumerable<T> GetAll(string? IncludeProperties = null);
    }
}
