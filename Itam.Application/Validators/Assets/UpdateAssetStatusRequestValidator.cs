using FluentValidation;
using Itam.Application.DTOs.Assets;

namespace Itam.Application.Validators.Assets;

public sealed class UpdateAssetStatusRequestValidator : AbstractValidator<UpdateAssetStatusRequestDto>
{
    public UpdateAssetStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum().WithMessage("Status must be a valid asset status.");
    }
}
