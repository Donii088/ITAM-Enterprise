import * as React from 'react';
import { FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/lib/formatters';
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  validateAttachmentFile,
  type FileValidationResult,
} from '@/lib/file-validation';
import { cn } from '@/lib/utils';

export interface FormFileInputProps {
  label?: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  accept?: string[];
  validate?: (file: File) => FileValidationResult;
  browseLabel?: string;
  helpText?: string;
}

export function FormFileInput({
  label,
  hint,
  file,
  onChange,
  error,
  disabled,
  accept = ALLOWED_ATTACHMENT_EXTENSIONS,
  validate = validateAttachmentFile,
  browseLabel = 'Click to upload a file',
  helpText = 'JPG, PNG or PDF — up to 5MB',
}: FormFileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  function handleSelect(selected: File | null) {
    if (!selected) {
      onChange(null);
      setLocalError(undefined);
      return;
    }
    const result = validate(selected);
    if (!result.valid) {
      setLocalError(result.error);
      onChange(null);
      return;
    }
    setLocalError(undefined);
    onChange(selected);
  }

  return (
    <FormField label={label} hint={hint} error={error ?? localError}>
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleSelect(null)}
            disabled={disabled}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'focus-ring flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary-400 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{browseLabel}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-3 w-3" /> {helpText}
          </span>
        </button>
      )}
    </FormField>
  );
}
