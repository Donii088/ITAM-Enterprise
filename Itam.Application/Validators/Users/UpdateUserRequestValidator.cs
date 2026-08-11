using FluentValidation;
using Itam.Application.DTOs.Users;

namespace Itam.Application.Validators.Users;

public sealed class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequestDto>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.JobTitle).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Role).IsInEnum();
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);

        // Admins may optionally reset another user's password from the edit form; when left
        // blank the existing password hash is untouched.
        RuleFor(x => x.NewPassword!)
            .MustBeStrongPassword()
            .When(x => !string.IsNullOrEmpty(x.NewPassword));
    }
}