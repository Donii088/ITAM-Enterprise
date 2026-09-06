import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  options: FormSelectOption[];
  disabled?: boolean;
  className?: string;
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  placeholder = 'Select…',
  options,
  disabled,
  className,
}: FormSelectProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={name}
          hint={hint}
          error={fieldState.error?.message}
          required={required}
          className={className}
        >
          <Select
            value={field.value != null && field.value !== '' ? String(field.value) : undefined}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={name} invalid={Boolean(fieldState.error)} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
}
