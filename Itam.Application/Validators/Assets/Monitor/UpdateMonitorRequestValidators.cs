using FluentValidation;
using Itam.Application.DTOs.Assets;


public sealed class UpdateMonitorRequestValidator : AbstractValidator<UpdateMonitorRequestDto>
{
    public UpdateMonitorRequestValidator()
    {
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Resolution).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RefreshRate).GreaterThan(0);
        RuleFor(x => x.Size).GreaterThan(0);
    }
}