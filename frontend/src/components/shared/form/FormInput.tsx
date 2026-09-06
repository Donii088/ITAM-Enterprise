import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { Input, type InputProps } from '@/components/ui/Input';

export interface FormInputProps<TFieldValues extends FieldValues>
  extends Omit<InputProps, 'name' | 'defaultValue' | 'className'> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  hint?: string;
  required?: boolean;
  /** Applied to the field's wrapper (e.g. for grid `col-span-*` placement), not the input itself. */
  className?: string;
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  className,
  ...inputProps
}: FormInputProps<TFieldValues>) {
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
          <Input
            {...inputProps}
            {...field}
            value={field.value ?? ''}
            invalid={Boolean(fieldState.error)}
          />
        </FormField>
      )}
    />
  );
}
