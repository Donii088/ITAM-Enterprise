import * as React from 'react';
import { Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { formatFileSize } from '@/lib/formatters';
import { ALLOWED_ATTACHMENT_EXTENSIONS, validateAttachmentFile, type FileValidationResult } from '@/lib/file-validation';
import { cn } from '@/lib/utils';

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string | null;
}

export interface MultiFileInputProps {
  label?: string;
  hint?: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string[];
  validate?: (file: File) => FileValidationResult;
  browseLabel?: string;
  helpText?: string;
  disabled?: boolean;
  maxFiles?: number;
}

export function MultiFileInput({
  label,
  hint,
  files,
  onChange,
  accept = ALLOWED_ATTACHMENT_EXTENSIONS,
  validate = validateAttachmentFile,
  browseLabel = 'Click to upload, or drag and drop',
  helpText = 'JPG, PNG or PDF — up to 5MB each',
  disabled,
  maxFiles,
}: MultiFileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  // File objects aren't stable identities across renders, so previews are keyed by a stable id
  // assigned when each one is staged, not by array index.
  const [staged, setStaged] = React.useState<StagedFile[]>([]);

  React.useEffect(() => {
    setStaged((prev) => {
      const next = files.map((file) => {
        const existing = prev.find((s) => s.file === file);
        return existing ?? { id: crypto.randomUUID(), file, previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null };
      });
      prev.forEach((s) => {
        if (!next.some((n) => n.id === s.id) && s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  React.useEffect(() => {
    return () => {
      staged.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;

    const nextErrors: string[] = [];
    const accepted: File[] = [];
    const remainingSlots = maxFiles ? Math.max(0, maxFiles - files.length) : Infinity;

    Array.from(selected).forEach((file, index) => {
      if (index >= remainingSlots) {
        nextErrors.push(`${file.name}: only ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed.`);
        return;
      }
      const result = validate(file);
      if (!result.valid) {
        nextErrors.push(`${file.name}: ${result.error}`);
        return;
      }
      accepted.push(file);
    });

    setErrors(nextErrors);
    if (accepted.length > 0) onChange([...files, ...accepted]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeFile(id: string) {
    const target = staged.find((s) => s.id === id);
    if (!target) return;
    onChange(files.filter((f) => f !== target.file));
  }

  const atCapacity = maxFiles !== undefined && files.length >= maxFiles;

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept.join(',')}
        className="sr-only"
        disabled={disabled || atCapacity}
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {staged.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {staged.map(({ id, file, previewUrl }) => (
            <li key={id} className="group relative overflow-hidden rounded-lg border border-border">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-24 w-full object-cover" />
              ) : (
                <div className="flex h-24 w-full items-center justify-center bg-muted px-2 text-center text-xs text-muted-foreground">
                  {file.name}
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(id)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="focus-ring absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="truncate bg-surface px-1.5 py-1 text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={disabled || atCapacity}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'focus-ring flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary-400 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">
          {atCapacity ? `Maximum ${maxFiles} files reached` : browseLabel}
        </span>
        {!atCapacity && <span className="text-xs text-muted-foreground">{helpText}</span>}
      </button>

      {errors.length > 0 && (
        <ul className="space-y-0.5">
          {errors.map((message, index) => (
            <li key={index} role="alert" className="text-xs font-medium text-danger">
              {message}
            </li>
          ))}
        </ul>
      )}
      {errors.length === 0 && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
