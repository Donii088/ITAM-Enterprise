import * as React from 'react';
import { Download, ImageOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime, formatFileSize } from '@/lib/formatters';
import { useAttachmentPreview } from '@/features/attachments/useAttachments';
import type { Attachment } from '@/types';

export interface AttachmentImagePreviewDialogProps {
  attachment: Attachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (attachment: Attachment) => void;
}

export function AttachmentImagePreviewDialog({
  attachment,
  open,
  onOpenChange,
  onDownload,
}: AttachmentImagePreviewDialogProps) {
  const { data, isPending, isError, refetch } = useAttachmentPreview(attachment, open);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!data) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(data.blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">
            {attachment ? `${attachment.fileName}${attachment.fileExtension}` : 'Photo preview'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[16rem] items-center justify-center overflow-hidden rounded-lg bg-muted/50">
          {isPending && <Spinner size={32} />}
          {isError && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Couldn't load this image</p>
              <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}
          {objectUrl && !isPending && !isError && (
            <img
              src={objectUrl}
              alt={attachment ? `${attachment.fileName}${attachment.fileExtension}` : 'Attachment preview'}
              className="max-h-[70vh] w-full object-contain"
            />
          )}
        </div>

        {attachment && (
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.fileSize)} · {formatDateTime(attachment.createdAt)}
            </p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => onDownload(attachment)}
            >
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
