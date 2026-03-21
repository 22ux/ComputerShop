using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Auth;

public class RegisterRequest
{
    [Required, StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), StringLength(50)]
    public string Password { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required, StringLength(255)]
    public string Address { get; set; } = string.Empty;
}
