using FluentValidation;
using Itam.Application.DTOs.Repairs;

namespace Itam.Application.Validators.Repairs;

public sealed class GetRepairsQueryValidator : AbstractValidator<GetRepairsQuery>
{
    public GetRepairsQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}