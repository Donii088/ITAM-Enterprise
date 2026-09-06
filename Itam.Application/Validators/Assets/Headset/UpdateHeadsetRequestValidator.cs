using FluentValidation;
using Itam.Application.DTOs.Assets;
using Itam.Domain.Enums;

namespace Itam.Application.Validators.Assets.Headset;

public sealed class UpdateHeadsetRequestValidator : AbstractValidator<UpdateHeadsetRequestDto>
{
    public UpdateHeadsetRequestValidator()
    {
        RuleFor(x => x.SerialNumber).MaximumLength(150).When(x => !string.IsNullOrWhiteSpace(x.SerialNumber));
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ConnectionType)
            .Must(c => c is ConnectionType.Wired or ConnectionType.Bluetooth)
            .WithMessage("Connection type must be Wired or Bluetooth.");
    }
}
