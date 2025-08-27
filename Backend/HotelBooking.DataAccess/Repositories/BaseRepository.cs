using HotelBooking.DataAccess.Data;
using HotelBooking.DataAccess.Repositories.Interfaces;
using HotelBooking.Models.Models;
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
        public IEnumerable<T> GetAll(Expression<Func<T, bool>>? filter = null, string? IncludeProperties = null)
        {
            IQueryable<T> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

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
        public void Create<T>(T obj) where T : BaseEntity
        {
            obj.createdAt = DateTime.Now;
            obj.updatedAt = DateTime.Now;
            _dbContext.Add(obj);
        }
        public bool Remove(int id)
        {
            if (id == 0)
            {
                return false;
            }
            var objToRemove = _dbContext.Set<T>().Find(id);
            if (objToRemove == null)
                return false;
            _dbContext.Set<T>().Remove(objToRemove);
            return true;
        }
        public void Edit<T>(T obj) where T : BaseEntity
        {
            if (obj == null)
            {
                throw new ArgumentNullException(nameof(obj), "Object cannot be null");
            }
            obj.updatedAt = DateTime.Now;
            _dbContext.Update(obj);
        }
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbContext.Set<T>().ToListAsync();
        }

        public async Task<T?> GetAsync(Expression<Func<T, bool>> filter)
        {
            return await _dbContext.Set<T>().FirstOrDefaultAsync(filter);
        }

        
    }
}
