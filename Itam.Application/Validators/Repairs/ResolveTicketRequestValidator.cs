using FluentValidation;
using Itam.Application.DTOs.Repairs;

namespace Itam.Application.Validators.Repairs;

public sealed class ResolveTicketRequestValidator : AbstractValidator<ResolveTicketRequestDto>
{
    public ResolveTicketRequestValidator()
    {
        RuleFor(x => x.RepairDescription).NotEmpty().MaximumLength(4000);
    }
}