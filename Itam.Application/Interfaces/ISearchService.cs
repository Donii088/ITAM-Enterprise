using Itam.Application.DTOs.Search;

namespace Itam.Application.Interfaces;

public interface ISearchService
{
    Task<SearchResultsDto> SearchAsync(GetSearchQuery query, CancellationToken ct = default);
}