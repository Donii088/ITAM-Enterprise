import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { Textarea, type TextareaProps } from '@/components/ui/Textarea';

export interface FormTextareaProps<TFieldValues extends FieldValues>
  extends Omit<TextareaProps, 'name' | 'defaultValue' | 'className'> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  hint?: string;
  required?: boolean;
  /** Applied to the field's wrapper (e.g. for grid `col-span-*` placement), not the textarea itself. */
  className?: string;
}

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  className,
  ...textareaProps
}: FormTextareaProps<TFieldValues>) {
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
          <Textarea
            {...textareaProps}
            {...field}
            value={field.value ?? ''}
            invalid={Boolean(fieldState.error)}
          />
        </FormField>
      )}
    />
  );
}
