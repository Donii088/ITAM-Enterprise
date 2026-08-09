import { Badge } from './Badge';
import {
  ASSET_STATUS_BADGE,
  ASSET_STATUS_LABELS,
  TICKET_STATUS_BADGE,
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_BADGE,
  type AssetStatus,
  type TicketStatus,
  type TicketPriority,
} from '@/types';

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return <Badge variant={ASSET_STATUS_BADGE[status]} dot>{ASSET_STATUS_LABELS[status]}</Badge>;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={TICKET_STATUS_BADGE[status]} dot>{TICKET_STATUS_LABELS[status]}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant={TICKET_PRIORITY_BADGE[priority]} dot>
      {priority}
    </Badge>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'success' : 'default'} dot>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
