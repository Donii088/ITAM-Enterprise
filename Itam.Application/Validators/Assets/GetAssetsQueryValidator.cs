using FluentValidation;
using Itam.Application.DTOs.Assets;

namespace Itam.Application.Validators.Assets;

public sealed class GetAssetsQueryValidator : AbstractValidator<GetAssetsQuery>
{
    public GetAssetsQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
