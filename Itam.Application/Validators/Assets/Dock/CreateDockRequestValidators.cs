using FluentValidation;
using Itam.Application.DTOs.Assets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Itam.Application.Validators.Assets.Dock;

public sealed class CreateDockRequestValidator : AbstractValidator<CreateDockRequestDto>
{
    public CreateDockRequestValidator()
    {
        RuleFor(x => x.SerialNumber).MaximumLength(150).When(x => !string.IsNullOrWhiteSpace(x.SerialNumber));
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
    }
}