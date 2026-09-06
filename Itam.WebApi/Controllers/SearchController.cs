using Itam.Application.DTOs.Search;
using Itam.Application.Interfaces;
using Itam.Application.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Itam.WebApi.Controllers;

[ApiController]
[Route("api/search")]
[Authorize]
public sealed class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<SearchResultsDto>>> Search(
        [FromQuery] GetSearchQuery query,
        CancellationToken cancellationToken)
    {
        var results = await _searchService.SearchAsync(query, cancellationToken);
        return Ok(ApiResponse.Ok(results, "Search completed successfully."));
    }
}