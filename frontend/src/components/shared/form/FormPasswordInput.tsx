import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormInput } from './FormInput';

export interface FormPasswordInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

export function FormPasswordInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hint,
  required,
  autoComplete = 'new-password',
  className,
}: FormPasswordInputProps<TFieldValues>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <FormInput
      control={control}
      name={name}
      label={label}
      hint={hint}
      required={required}
      className={className}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="focus-ring rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}
