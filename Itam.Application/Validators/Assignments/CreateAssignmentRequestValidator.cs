using FluentValidation;
using Itam.Application.DTOs.Assignments;

namespace Itam.Application.Validators.Assignments;

public sealed class CreateAssignmentRequestValidator : AbstractValidator<CreateAssignmentRequestDto>
{
    public CreateAssignmentRequestValidator()
    {
        RuleFor(x => x.AssetId).NotEmpty().WithMessage("AssetId is required.");
        RuleFor(x => x.EmployeeId).NotEmpty().WithMessage("EmployeeId is required.");
    }
}