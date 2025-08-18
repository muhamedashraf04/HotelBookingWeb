using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HotelBooking.DataAccess.Repos
{
    public class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        ApplicationDBContext _dbContext;
        DbSet<T> dbSet;
        public BaseRepository(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
            this.dbSet = _dbContext.Set<T>();
        }
        public T Get(Expression<Func<T, bool>> Filter, string? IncludeProperties = null)
        {
            IQueryable<T> query = this.dbSet;
            query = query.Where(Filter);
            if (!string.IsNullOrEmpty(IncludeProperties))
            {
                foreach (var property in IncludeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(property);
                }
            }
            return query.FirstOrDefault();
        }
        public IEnumerable<T> GetAll(string? IncludeProperties = null)
        {
            IQueryable<T> query = dbSet;
            if (!string.IsNullOrEmpty(IncludeProperties))
            {
                foreach (var property in IncludeProperties.
                    Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(property);
                }
            }
            return query.ToList();

        }
        public void Create(T obj)
        {
            _dbContext.Add(obj);
        }
    }
}
