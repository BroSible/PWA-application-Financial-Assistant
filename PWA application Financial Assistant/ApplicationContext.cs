using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace PWA_application_Financial_Assistant
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Person> People { get; set; }

        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }

    public class Person
    {
        public int id { get; set; }
        public string email { get; set; }
        public string password { get; set; }
    }

}
