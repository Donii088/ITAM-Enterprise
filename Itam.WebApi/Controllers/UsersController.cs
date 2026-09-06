using Itam.Application.Common;
using Itam.Application.DTOs.Users;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Itam.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = RoleConstants.ItAdmin)]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create(
        [FromBody] CreateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var user = await _userService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse.Ok(user, "User created successfully."));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> Get(
        [FromQuery] GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _userService.GetPagedAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(result, "Users retrieved successfully."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(user, "User retrieved successfully."));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Update(
        Guid id,
        [FromBody] UpdateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var user = await _userService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponse.Ok(user, "User updated successfully."));
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userService.DeactivateAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(user, "User deactivated. Assigned assets released."));
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Activate(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userService.ActivateAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok(user, "User activated."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> HardDelete(Guid id, CancellationToken cancellationToken)
    {
        await _userService.HardDeleteAsync(id, cancellationToken);
        return Ok(ApiResponse.Ok("User hard deleted."));
    }
}