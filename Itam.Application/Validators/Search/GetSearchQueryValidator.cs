using FluentValidation;
using Itam.Application.DTOs.Search;

namespace Itam.Application.Validators.Search;

public sealed class GetSearchQueryValidator : AbstractValidator<GetSearchQuery>
{
    public GetSearchQueryValidator()
    {
        RuleFor(x => x.Term)
            .NotEmpty().WithMessage("A search term is required.")
            .MinimumLength(2).WithMessage("Search term must be at least 2 characters.");

        RuleFor(x => x.Limit).InclusiveBetween(1, 50);
    }
}