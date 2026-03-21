namespace ComputerStore.Bll.Dtos.Auth;

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserProfileDto User { get; set; } = new();
}
