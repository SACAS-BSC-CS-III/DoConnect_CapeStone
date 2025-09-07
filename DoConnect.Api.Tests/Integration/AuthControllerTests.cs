using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace DoConnect.Api.Tests.Integration
{
    public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public AuthControllerTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Login_SeededAdmin_Returns_Token()
        {
            var client = _factory.CreateClient();

            var loginObj = new
            {
                username = "admin",
                password = "Admin@123"
            };

            var resp = await client.PostAsJsonAsync("/api/auth/login", loginObj);
            resp.EnsureSuccessStatusCode();

            var body = await resp.Content.ReadFromJsonAsync<AuthResponse>();
            Assert.False(string.IsNullOrWhiteSpace(body?.token));
            Assert.Equal("admin", body?.username);
            Assert.Equal("Admin", body?.role); // matches created role string
        }

        [Fact]
        public async Task Login_SeededUser_Returns_Token()
        {
            var client = _factory.CreateClient();

            var loginObj = new
            {
                username = "testuser",
                password = "Test@123"
            };

            var resp = await client.PostAsJsonAsync("/api/auth/login", loginObj);
            resp.EnsureSuccessStatusCode();

            var body = await resp.Content.ReadFromJsonAsync<AuthResponse>();
            Assert.False(string.IsNullOrWhiteSpace(body?.token));
            Assert.Equal("testuser", body?.username);
            Assert.Equal("User", body?.role);
        }

        // small internal DTO to read the response
        private class AuthResponse
        {
            public string token { get; set; } = default!;
            public string username { get; set; } = default!;
            public string role { get; set; } = default!;
        }
    }
}