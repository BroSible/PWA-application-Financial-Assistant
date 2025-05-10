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
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Short> Shorts { get; set; }


        public ApplicationContext(DbContextOptions<ApplicationContext> options)
            : base(options)
        {
            Database.EnsureCreated();
        }

        public class TopUpRequest
        {
            public decimal Amount { get; set; }
        }
    }

    public class Person
    {
        public int personId { get; set; }
        public string email { get; set; }
        public string password { get; set; }

        public string Role { get; set; } = "User";

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
        public decimal saved { get; set; } = 0;

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
    public class UserProfile
    {
        public int id { get; set; }
        public int personId { get; set; }

        public string? username { get; set; }
        public string? bio { get; set; }
        public string? avatar_path { get; set; }
        public DateTime? birthdate { get; set; }

        public DateTime? created_at { get; set; }
        public DateTime? updated_at { get; set; }
    }

    public class Short
    {
        public int Id { get; set; }
        public string Title { get; set; } // Название или подпись
        public string FilePath { get; set; } // Относительный путь к файлу
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }


}
