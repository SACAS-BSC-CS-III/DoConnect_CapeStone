using DoConnect.Api.Entities;

namespace DoConnect.Api.Services;
public interface IJwtService
{
    string Create(User user);
}
