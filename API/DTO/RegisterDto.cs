using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";
    [Required]
    public string DisplayName { get; set; } = "";
    [Required]
    [MinLength(8)]
    [MaxLength(20)]
    public string Password { get; set; } = "";
    [Required]
    public string Gender { get; set; } = string.Empty;
    [Required]
    public string City { get; set; } = string.Empty;
    [Required]
    public string Country { get; set; } = string.Empty;
    [Required]
    public DateOnly DateOfBirth { get; set; }
}
