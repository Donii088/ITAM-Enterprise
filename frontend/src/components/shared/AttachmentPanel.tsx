import * as React from 'react';
import { Download, FileText, Image as ImageIcon, Paperclip, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AttachmentImagePreviewDialog } from './AttachmentImagePreviewDialog';
import { formatDateTime, formatFileSize } from '@/lib/formatters';
import { ALLOWED_ATTACHMENT_EXTENSIONS, validateAttachmentFile } from '@/lib/file-validation';
import { toast } from 'sonner';
import type { Attachment } from '@/types';

function AttachmentMeta({ attachment }: { attachment: Attachment }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
        <span className="truncate">
          {attachment.fileName}
          {attachment.fileExtension}
        </span>
        {attachment.repairHistoryId && (
          <Badge variant="primary" className="shrink-0 px-2 py-0 text-[10px] uppercase tracking-wide">
            Resolution
          </Badge>
        )}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {formatFileSize(attachment.fileSize)} · {formatDateTime(attachment.createdAt)}
        {attachment.uploadedByName ? ` · Uploaded by ${attachment.uploadedByName}` : ''}
      </p>
    </div>
  );
}

export interface AttachmentPanelProps {
  attachments: Attachment[] | undefined;
  isLoading?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
  onUpload?: (file: File) => void;
  onDownload: (attachment: Attachment) => void;
  onDelete?: (attachment: Attachment) => void;
}

export function AttachmentPanel({
  attachments,
  isLoading,
  canUpload,
  canDelete,
  isUploading,
  isDeleting,
  onUpload,
  onDownload,
  onDelete,
}: AttachmentPanelProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Attachment | null>(null);
  const [previewTarget, setPreviewTarget] = React.useState<Attachment | null>(null);

  function handleFileSelect(file: File | null) {
    if (!file || !onUpload) return;
    const result = validateAttachmentFile(file);
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canUpload && onUpload && (
        <div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={ALLOWED_ATTACHMENT_EXTENSIONS.join(',')}
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => inputRef.current?.click()}
            isLoading={isUploading}
          >
            Upload attachment
          </Button>
        </div>
      )}

      {!attachments || attachments.length === 0 ? (
        <EmptyState icon={Paperclip} title="No attachments" description="Files related to this record will appear here." />
      ) : (
        <ul className="space-y-2">
          {attachments.map((attachment) => {
            const isImage = attachment.contentType.startsWith('image/');
            return (
              <li
                key={attachment.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
              >
                {isImage ? (
                  <button
                    type="button"
                    onClick={() => setPreviewTarget(attachment)}
                    className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-md text-left"
                    aria-label={`Preview ${attachment.fileName}${attachment.fileExtension}`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <AttachmentMeta attachment={attachment} />
                  </button>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <AttachmentMeta attachment={attachment} />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDownload(attachment)}
                  aria-label={`Download ${attachment.fileName}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger hover:bg-danger/10"
                    onClick={() => setPendingDelete(attachment)}
                    aria-label={`Delete ${attachment.fileName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete attachment"
        description={`Are you sure you want to delete "${pendingDelete?.fileName}${pendingDelete?.fileExtension}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={() => {
          if (pendingDelete && onDelete) onDelete(pendingDelete);
          setPendingDelete(null);
        }}
      />

      <AttachmentImagePreviewDialog
        attachment={previewTarget}
        open={Boolean(previewTarget)}
        onOpenChange={(open) => !open && setPreviewTarget(null)}
        onDownload={onDownload}
      />
    </div>
  );
}
