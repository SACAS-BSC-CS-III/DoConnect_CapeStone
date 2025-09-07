using System.IdentityModel.Tokens.Jwt;
using DoConnect.Api.Entities;
using DoConnect.Api.Services;
using Microsoft.Extensions.Options;
using Xunit;

public class JwtServiceTests
{
    [Fact]
    public void Create_Returns_ValidJwt_WithExpectedClaims()
    {
        var opts = Options.Create(new JwtOptions
        {
            Key = "ThisIsATestKeyWithSufficientLength123!",
            Issuer = "DoConnect",
            Audience = "DoConnectClients",
            ExpiryMinutes = 60
        });

        var svc = new JwtService(opts);
        var user = new User { Id = 123, Username = "alice", Role = UserRole.Admin };

        var token = svc.Create(user);

        Assert.False(string.IsNullOrWhiteSpace(token));
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == user.Id.ToString());
        Assert.Contains(jwt.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Name && c.Value == user.Username);
        Assert.Contains(jwt.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == user.Role.ToString());
    }
}