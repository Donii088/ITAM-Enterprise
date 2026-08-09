export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
export const ALLOWED_ATTACHMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const MAX_UPLOAD_SIZE_BYTES = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_BYTES) || 5 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAttachmentFile(file: File): FileValidationResult {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(', ')}`,
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    const maxMb = (MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File is too large. Maximum size is ${maxMb} MB.` };
  }

  return { valid: true };
}
