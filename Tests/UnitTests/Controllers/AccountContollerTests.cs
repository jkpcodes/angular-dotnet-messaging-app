using Moq;
using Xunit;
using Microsoft.AspNetCore.Identity;
using API.Controllers;
using API.Interfaces;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using API.DTO;
using Microsoft.AspNetCore.Http;

namespace Tests.UnitTests.Controllers;

public class AccountControllerTests
{
    private readonly Mock<UserManager<AppUser>> _userManagerMock;
    private readonly Mock<ITokenService> _tokenService;
    private readonly AccountController _controller;

    public AccountControllerTests()
    {
        // Mock UserManager Dependencies
        var userStoreMock = new Mock<IUserStore<AppUser>>();
        _userManagerMock = new Mock<UserManager<AppUser>>(
            userStoreMock.Object,
            null, // IOptions<IdentityOptions>
            null, // IPasswordHasher<AppUser>
            null, // IEnumerable<IUserValidator<AppUser>>
            null, // IEnumerable<IPasswordValidator<AppUser>>
            null, // ILookupNormalizer
            null, // IdentityErrorDescriber
            null, // IServiceProvider
            null  // ILogger<UserManager<AppUser>>
        );

        _tokenService = new Mock<ITokenService>();
        _controller = new AccountController(_userManagerMock.Object, _tokenService.Object);
    }

    private AppUser CreateTestUser(string email = "")
    {
        return new AppUser
        {
            Email = email,
            DisplayName = "Test User",
            Member = new Member
            {
                Id = "1",
                DateOfBirth = new DateOnly(1997, 1, 1),
                DisplayName = "Test User",
                Gender = "Male",
                City = "Test City",
                Country = "Test Country",
            }
        };
    }

    // Add test methods for Register, Login, and RefreshToken here

    [Fact]
    [Trait("Category", "Login")]
    public async Task Login_WhenUserNotFound_ReturnsUnauthorizedObjectResult()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@test.com", Password = "Password1234" };

        _userManagerMock.Setup(um => um.FindByEmailAsync(loginDto.Email))
            .ReturnsAsync((AppUser)null);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var response = Assert.IsType<ActionResult<UserDto>>(result);
        Assert.IsType<UnauthorizedObjectResult>(response.Result);
        Assert.Equal("Invalid email or password", ((UnauthorizedObjectResult)response.Result).Value);
    }

    [Fact]
    [Trait("Category", "Login")]
    public async Task Login_WhenPasswordIncorrect_ReturnsUnauthorizedObjectResult()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@test.com", Password = "Password1234" };

        _userManagerMock.Setup(um => um.FindByEmailAsync(loginDto.Email))
            .ReturnsAsync(CreateTestUser(loginDto.Email));
        _userManagerMock.Setup(um => um.CheckPasswordAsync(It.IsAny<AppUser>(), loginDto.Password))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var response = Assert.IsType<ActionResult<UserDto>>(result);
        Assert.IsType<UnauthorizedObjectResult>(response.Result);
        Assert.Equal("Invalid email or password", ((UnauthorizedObjectResult)response.Result).Value);
    }

    [Fact]
    [Trait("Category", "Login")]
    public async Task Login_WhenSuccessful_ReturnsUserDto()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "test@test.com", Password = "Password1234" };
        _userManagerMock.Setup(um => um.FindByEmailAsync(loginDto.Email))
            .ReturnsAsync(CreateTestUser(loginDto.Email));
        _userManagerMock.Setup(um => um.CheckPasswordAsync(It.IsAny<AppUser>(), loginDto.Password))
            .ReturnsAsync(true);
        _tokenService.Setup(ts => ts.CreateToken(It.IsAny<AppUser>()))
            .ReturnsAsync("token");

        // Mock HttpContext and Response.Cookies
        var cookiesMock = new Mock<IResponseCookies>();
        var httpContextMock = new Mock<HttpContext>();
        var httpResponse = new Mock<HttpResponse>();
        httpContextMock.Setup(ctx => ctx.Response.Cookies).Returns(cookiesMock.Object);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContextMock.Object,
        };

        var result = await _controller.Login(loginDto);

        // Assert
        var response = Assert.IsType<ActionResult<UserDto>>(result);
        var userDto = Assert.IsType<UserDto>(response.Value);
        Assert.Equal("test@test.com", userDto.Email);
        Assert.Equal("toke", userDto.Token);
    }
}