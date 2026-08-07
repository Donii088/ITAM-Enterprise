using FluentValidation;
using Itam.Application.DTOs.Assets;

namespace Itam.Application.Validators.Assets.Storage;

public sealed class CreateStorageRequestValidator : AbstractValidator<CreateStorageRequestDto>
{
    public CreateStorageRequestValidator()
    {
        RuleFor(x => x.SerialNumber).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Capacity).GreaterThan(0);
        RuleFor(x => x.StorageType).IsInEnum();
        RuleFor(x => x.StorageUnit).IsInEnum();

        // Unassigned (both null) is now VALID — it's a spare part.
        // But it can NEVER belong to both parents.
        RuleFor(x => x)
            .Must(x => !(x.LaptopId.HasValue && x.DesktopPcId.HasValue))
            .WithMessage("Storage can belong to a laptop OR a desktop PC, never both.");
    }
}