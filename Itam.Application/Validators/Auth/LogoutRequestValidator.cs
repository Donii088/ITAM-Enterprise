using FluentValidation;
using Itam.Application.DTOs.Auth;

namespace Itam.Application.Validators.Auth;

public sealed class LogoutRequestValidator : AbstractValidator<LogoutRequestDto>
{
    public LogoutRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.");
    }
}