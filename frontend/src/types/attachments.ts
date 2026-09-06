export interface Attachment {
  id: string;
  fileName: string;
  fileExtension: string;
  fileSize: number;
  contentType: string;
  ticketId: string | null;
  repairHistoryId: string | null;
  assetId: string | null;
  uploadedByUserId: string | null;
  uploadedByName: string | null;
  createdAt: string;
}
