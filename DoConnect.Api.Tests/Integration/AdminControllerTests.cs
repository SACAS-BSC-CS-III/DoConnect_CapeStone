using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using DoConnect.Api.Data;
using DoConnect.Api.Entities;
using System.Linq;

namespace DoConnect.Api.Tests.Integration
{
    public class AdminControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public AdminControllerTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Admin_Can_Approve_Pending_Question()
        {
            // arrange: create a pending question directly in the test DB so we don't have form-binding problems
            int pendingQuestionId;
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // find testuser
                var user = db.Users.First(u => u.Username == "testuser");

                var q = new Question
                {
                    Title = "Pending question from test",
                    Body = "Please approve me",
                    UserId = user.Id,
                    Status = ApprovalStatus.Pending
                };
                db.Questions.Add(q);
                await db.SaveChangesAsync();
                pendingQuestionId = q.Id;
            }

            // admin login to get token
            var client = _factory.CreateClient();
            var login = new { username = "admin", password = "Admin@123" };
            var loginResp = await client.PostAsJsonAsync("/api/auth/login", login);
            loginResp.EnsureSuccessStatusCode();
            var loginBody = await loginResp.Content.ReadFromJsonAsync<AuthResponse>();
            var token = loginBody!.token;

            // act: call admin approve endpoint
            var req = new HttpRequestMessage(HttpMethod.Post, $"/api/admin/questions/{pendingQuestionId}/approve?approve=true");
            req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var resp = await client.SendAsync(req);
            Assert.True(resp.StatusCode == HttpStatusCode.NoContent || resp.IsSuccessStatusCode);

            // assert: check DB that question is approved
            using (var scope = _factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var q = await db.Questions.FindAsync(pendingQuestionId);
                Assert.NotNull(q);
                Assert.Equal(ApprovalStatus.Approved, q!.Status);
            }
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