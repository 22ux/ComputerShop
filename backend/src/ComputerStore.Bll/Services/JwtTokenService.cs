using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ComputerStore.Bll.Configurations;
using ComputerStore.Bll.Interfaces;
using ComputerStore.Dal.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ComputerStore.Bll.Services;

public class JwtTokenService(IOptions<JwtOptions> options) : ITokenService
{
    private readonly JwtOptions _jwtOptions = options.Value;

    public (string Token, DateTime ExpiresAt) GenerateToken(User user, string roleName)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, roleName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        return (token, expiresAt);
    }
}
