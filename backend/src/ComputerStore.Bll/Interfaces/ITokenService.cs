using ComputerStore.Dal.Entities;

namespace ComputerStore.Bll.Interfaces;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user, string roleName);
}
