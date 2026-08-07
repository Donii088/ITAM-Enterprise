using FluentValidation;
using Itam.Application.DTOs.Assets;

namespace Itam.Application.Validators.Assets.DesktopPc;

public sealed class UpdateDesktopPcRequestValidator : AbstractValidator<UpdateDesktopPcRequestDto>
{
    public UpdateDesktopPcRequestValidator()
    {
        RuleFor(x => x.SerialNumber).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Cpu).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Gpu).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Ram).GreaterThan(0);
    }
}