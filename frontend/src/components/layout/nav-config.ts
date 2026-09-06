import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Laptop, Users2, Ticket, Wrench, ArrowLeftRight, Search, UserCircle } from 'lucide-react';
import { routes } from '@/routes/routes';
import { ROLES } from '@/lib/permissions';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', to: routes.dashboard, icon: LayoutDashboard, roles: [ROLES.ITADMIN, ROLES.EMPLOYEE] },
      { label: 'Search', to: routes.search, icon: Search, roles: [ROLES.ITADMIN, ROLES.EMPLOYEE] },
    ],
  },
  {
    title: 'My Workspace',
    items: [
      { label: 'My Assets', to: routes.myAssets, icon: Laptop, roles: [ROLES.EMPLOYEE] },
      { label: 'My Tickets', to: routes.tickets.mine, icon: Ticket, roles: [ROLES.ITADMIN, ROLES.EMPLOYEE] },
    ],
  },
  {
    title: 'Asset Management',
    items: [
      { label: 'Assets', to: routes.assets.list, icon: Laptop, roles: [ROLES.ITADMIN] },
      { label: 'Assignments', to: routes.assignments.list, icon: ArrowLeftRight, roles: [ROLES.ITADMIN] },
      { label: 'Repairs', to: routes.repairs.list, icon: Wrench, roles: [ROLES.ITADMIN] },
    ],
  },
  {
    title: 'Support',
    items: [{ label: 'All Tickets', to: routes.tickets.list, icon: Ticket, roles: [ROLES.ITADMIN] }],
  },
  {
    title: 'Administration',
    items: [{ label: 'Users', to: routes.users.list, icon: Users2, roles: [ROLES.ITADMIN] }],
  },
  {
    items: [{ label: 'Profile', to: routes.profile, icon: UserCircle, roles: [ROLES.ITADMIN, ROLES.EMPLOYEE] }],
  },
];
