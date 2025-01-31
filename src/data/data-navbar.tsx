import {
  IconUserCheck,
  IconChecklist,
  IconAddressBook,
} from '@tabler/icons-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export const navItems: NavItem[] = [
  { to: '/', icon: <IconUserCheck />, label: 'Resume' },
  { to: '/project', icon: <IconChecklist />, label: 'Project' },
  { to: '/contact', icon: <IconAddressBook />, label: 'Contact' },
];
