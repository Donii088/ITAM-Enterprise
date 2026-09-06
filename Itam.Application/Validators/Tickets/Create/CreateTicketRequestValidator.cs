using FluentValidation;
using Itam.Application.DTOs.Tickets;

namespace Itam.Application.Validators.Tickets.Create;

public sealed class CreateTicketRequestValidator : AbstractValidator<CreateTicketRequestDto>
{
    public CreateTicketRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.AssetId).NotEmpty().WithMessage("AssetId is required.");
    }
}