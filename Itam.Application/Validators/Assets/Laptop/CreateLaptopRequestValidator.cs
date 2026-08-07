using FluentValidation;
using Itam.Application.DTOs.Assets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Itam.Application.Validators.Assets.Laptop
{
    public sealed class CreateLaptopRequestValidator : AbstractValidator<CreateLaptopRequestDto>
    {
        public CreateLaptopRequestValidator() // removed IApplicationDbContext param
        {
            RuleFor(x => x.SerialNumber).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Model).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Cpu).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Gpu).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Ram).GreaterThan(0);
        }
    }
}
