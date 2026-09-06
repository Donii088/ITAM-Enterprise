using FluentValidation;
using Itam.Application.DTOs.Assets;
using Itam.Domain.Enums;

namespace Itam.Application.Validators.Assets.Headset;

public sealed class CreateHeadsetRequestValidator : AbstractValidator<CreateHeadsetRequestDto>
{
    public CreateHeadsetRequestValidator()
    {
        RuleFor(x => x.SerialNumber).MaximumLength(150).When(x => !string.IsNullOrWhiteSpace(x.SerialNumber));
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        // Headsets only support Wired/Bluetooth (unlike KeyboardMouseSet, which also allows
        // WirelessDongle) — .IsInEnum() alone would let WirelessDongle through since it's still a
        // valid ConnectionType value.
        RuleFor(x => x.ConnectionType)
            .Must(c => c is ConnectionType.Wired or ConnectionType.Bluetooth)
            .WithMessage("Connection type must be Wired or Bluetooth.");
    }
}
