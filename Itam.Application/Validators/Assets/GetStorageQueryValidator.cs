using FluentValidation;
using Itam.Application.DTOs.Assets;

namespace Itam.Application.Validators.Assets;

public sealed class GetStorageQueryValidator : AbstractValidator<GetStorageQuery>
{
    public GetStorageQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
