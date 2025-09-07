using System;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using DoConnect.Api;
using DoConnect.Api.Data;
using DoConnect.Api.Entities;
using System.Security.Cryptography;
using System.Text;

namespace DoConnect.Api.Tests
{
    /// <summary>
    /// WebApplicationFactory that replaces the real DB with an in-memory Sqlite DB for tests.
    /// It also seeds a test admin and a normal test user.
    /// </summary>
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IDisposable
    {
        private readonly SqliteConnection _connection;

        public CustomWebApplicationFactory()
        {
            // Keep the connection open for the lifetime of the factory so in-memory DB persists.
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove existing AppDbContext registrations to avoid multiple DB providers error
                services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
                services.RemoveAll(typeof(AppDbContext));

                // Register EF Core to use Sqlite in-memory connection
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseSqlite(_connection);
                });

                // Build service provider
                var sp = services.BuildServiceProvider();

                // Create a scope to ensure DB is created and seeded
                using (var scope = sp.CreateScope())
                {
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<AppDbContext>();

                    // Ensure database is created
                    db.Database.EnsureCreated();

                    // Clear any existing data and seed predictable test data
                    SeedTestData(db);
                }
            });
        }

        private static void SeedTestData(AppDbContext db)
        {
            // Clean DB tables (safe because in-memory DB is fresh)
            // Add seeded admin and test user
            // Generate password hash/salt identical to your runtime method (HMACSHA256)
            void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
            {
                using var hmac = new HMACSHA256();
                salt = hmac.Key;
                hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }

            if (!db.Users.Any(u => u.Username == "admin"))
            {
                CreatePasswordHash("Admin@123", out var hash, out var salt);
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@test.com",
                    PasswordHash = hash,
                    PasswordSalt = salt,
                    Role = UserRole.Admin
                };
                db.Users.Add(admin);
            }

            if (!db.Users.Any(u => u.Username == "testuser"))
            {
                CreatePasswordHash("Test@123", out var hash2, out var salt2);
                var testuser = new User
                {
                    Username = "testuser",
                    Email = "test@test.com",
                    PasswordHash = hash2,
                    PasswordSalt = salt2,
                    Role = UserRole.User
                };
                db.Users.Add(testuser);
            }

            db.SaveChanges();
        }

        public new HttpClient CreateClient()
        {
            // use default client creation
            return base.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = true
            });
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                _connection?.Close();
                _connection?.Dispose();
            }
        }
    }
}