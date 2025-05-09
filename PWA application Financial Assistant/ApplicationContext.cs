using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace PWA_application_Financial_Assistant
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Person> People { get; set; }
        public DbSet<Goals> Goals { get; set; }
        public DbSet<Expenses> Expenses { get; set; }

        public DbSet<User> Users { get; set; }


        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }
    }

    public class Person
    {
        public int personId { get; set; }
        public string email { get; set; }
        public string password { get; set; }
    }

    public class Goals
    {
        public int id { get; set; }
        public int personId { get; set; } // ID пользователя
        public string title { get; set; }
        public DateTime target_date { get; set; }
        public decimal amount { get; set; }
        public decimal income { get; set; }
        public string currency { get; set; }
        public decimal required_monthly_savings { get; set; }
    }

    public class Expenses
    {
        public int id { get; set; }
        public int personid { get; set; }
        public string title { get; set; }
        public DateTime date { get; set; }
        public decimal amount { get; set; }
        public string category { get; set; }
    }



}
