using FluentValidation;
using Itam.Application.DTOs.Assignments;

namespace Itam.Application.Validators.Assignments;

public sealed class GetAssignmentsQueryValidator : AbstractValidator<GetAssignmentsQuery>
{
    public GetAssignmentsQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
