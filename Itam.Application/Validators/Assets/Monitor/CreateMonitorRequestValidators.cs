using FluentValidation;
using Itam.Application.DTOs.Assets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Itam.Application.Validators.Assets.Monitor;

public sealed class CreateMonitorRequestValidator : AbstractValidator<CreateMonitorRequestDto>
{
    public CreateMonitorRequestValidator()
    {
        RuleFor(x => x.SerialNumber).MaximumLength(150).When(x => !string.IsNullOrWhiteSpace(x.SerialNumber));
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Resolution).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RefreshRate).GreaterThan(0);
        RuleFor(x => x.Size).GreaterThan(0);
    }
}