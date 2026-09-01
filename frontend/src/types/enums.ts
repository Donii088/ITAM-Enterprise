// Mirrors Itam.Domain.Enums.* — backend serializes enums as camelCase-independent
// PascalCase strings via JsonStringEnumConverter (default naming, no camel policy applied
// to enum converter), so the wire values match the C# member names exactly.

export const ASSET_TYPE = {
  Laptop: 'Laptop',
  DesktopPc: 'DesktopPc',
  Monitor: 'Monitor',
  Dock: 'Dock',
  KeyboardMouseSet: 'KeyboardMouseSet',
} as const;
export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  Laptop: 'Laptop',
  DesktopPc: 'Desktop PC',
  Monitor: 'Monitor',
  Dock: 'Dock',
  KeyboardMouseSet: 'Keyboard & Mouse Set',
};

export const ASSET_STATUS = {
  Available: 'Available',
  Assigned: 'Assigned',
  InRepair: 'InRepair',
  Broken: 'Broken',
} as const;
export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  Available: 'Available',
  Assigned: 'Assigned',
  InRepair: 'In Repair',
  Broken: 'Broken',
};

export const ASSET_STATUS_BADGE: Record<AssetStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  Available: 'success',
  Assigned: 'info',
  InRepair: 'warning',
  Broken: 'danger',
};

export const CONNECTION_TYPE = {
  Wired: 'Wired',
  Bluetooth: 'Bluetooth',
  WirelessDongle: 'WirelessDongle',
} as const;
export type ConnectionType = (typeof CONNECTION_TYPE)[keyof typeof CONNECTION_TYPE];

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  Wired: 'Wired',
  Bluetooth: 'Bluetooth',
  WirelessDongle: 'Wireless Dongle',
};

export const ROLE = {
  Employee: 'Employee',
  ItAdmin: 'ItAdmin',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const ROLE_LABELS: Record<Role, string> = {
  Employee: 'Employee',
  ItAdmin: 'IT Admin',
};

export const STORAGE_TYPE = {
  SSD: 'SSD',
  NVMe: 'NVMe',
  HDD: 'HDD',
} as const;
export type StorageType = (typeof STORAGE_TYPE)[keyof typeof STORAGE_TYPE];

export const STORAGE_UNIT = {
  GB: 'GB',
  TB: 'TB',
} as const;
export type StorageUnit = (typeof STORAGE_UNIT)[keyof typeof STORAGE_UNIT];

export const TICKET_PRIORITY = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
} as const;
export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export const TICKET_PRIORITY_BADGE: Record<TicketPriority, 'success' | 'info' | 'warning' | 'danger'> = {
  Low: 'success',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
};

export const TICKET_STATUS = {
  Open: 'Open',
  OnReview: 'OnReview',
  InProgress: 'InProgress',
  // Done: 'Done',
  // Cancelled: 'Cancelled',
} as const;
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  Open: 'Open',
  OnReview: 'On Review',
  InProgress: 'In Progress',
  Done: 'Done',
  Cancelled: 'Cancelled',
};

export const TICKET_STATUS_BADGE: Record<TicketStatus, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  Open: 'info',
  OnReview: 'warning',
  InProgress: 'warning',
  Done: 'success',
  Cancelled: 'default',
};
