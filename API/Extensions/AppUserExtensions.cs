using API.Entities;
using API.Interfaces;
using API.DTO;
using System.Threading.Tasks;

namespace API.Extensions;

public static class AppUserExtensions
{
    public static async Task<UserDto> MapToDto(this AppUser user, ITokenService tokenService)
    {
        return new UserDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email!,
            Token = await tokenService.CreateToken(user),
            ImageUrl = user.ImageUrl,
        };
    }
}