using System.ComponentModel.DataAnnotations;

namespace ComputerStore.Bll.Dtos.Auth;

public class UpdateProfileRequest
{
    [Required, StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required, StringLength(255)]
    public string Address { get; set; } = string.Empty;
}
