export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
export const ALLOWED_ATTACHMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Ticket "photo" uploads are image-only (no PDF), matching the request's explicit jpg/jpeg/png/webp scope.
export const ALLOWED_PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MAX_UPLOAD_SIZE_BYTES = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_BYTES) || 5 * 1024 * 1024;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

function validateAgainst(file: File, allowedExtensions: string[]): FileValidationResult {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    const maxMb = (MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File is too large. Maximum size is ${maxMb} MB.` };
  }

  return { valid: true };
}

export function validateAttachmentFile(file: File): FileValidationResult {
  return validateAgainst(file, ALLOWED_ATTACHMENT_EXTENSIONS);
}

export function validatePhotoFile(file: File): FileValidationResult {
  return validateAgainst(file, ALLOWED_PHOTO_EXTENSIONS);
}
