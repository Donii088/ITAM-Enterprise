using FluentValidation;
using Itam.Application.DTOs.Assets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Itam.Application.Validators.Assets.KeyboardMouseSet
{
    public sealed class CreateKeyboardMouseSetRequestValidator : AbstractValidator<CreateKeyboardMouseSetRequestDto>
    {
        public CreateKeyboardMouseSetRequestValidator()
        {
            RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
            RuleFor(x => x.ConnectionType).IsInEnum();
        }
    }
}
