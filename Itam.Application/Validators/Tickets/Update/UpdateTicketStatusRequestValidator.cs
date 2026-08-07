using FluentValidation;
using Itam.Application.DTOs.Tickets;

namespace Itam.Application.Validators.Tickets.Update;

public sealed class UpdateTicketStatusRequestValidator : AbstractValidator<UpdateTicketStatusRequestDto>
{
    public UpdateTicketStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}