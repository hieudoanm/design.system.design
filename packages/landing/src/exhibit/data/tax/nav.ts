import {
  FiHome,
  FiFileText,
  FiShield,
  FiUser,
  FiSettings,
  FiPlus,
} from 'react-icons/fi';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof FiHome;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const businessNavGroups: NavGroup[] = [
  {
    label: 'Business',
    items: [{ label: 'Dashboard', href: '/design-system/exhibits/tax', icon: FiHome }],
  },
  {
    label: 'Tax Submission',
    items: [
      { label: 'Submissions', href: '/design-system/exhibits/tax', icon: FiFileText },
      {
        label: 'New Submission',
        href: '/design-system/exhibits/tax',
        icon: FiPlus,
      },
    ],
  },
  {
    label: 'Tax Audit',
    items: [{ label: 'Audits', href: '/design-system/exhibits/tax', icon: FiShield }],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', href: '/design-system/exhibits/tax', icon: FiUser },
      { label: 'Settings', href: '/design-system/exhibits/tax', icon: FiSettings },
    ],
  },
];

export const businessBottomNavItems: NavItem[] = [
  { label: 'Home', href: '/design-system/exhibits/tax', icon: FiHome },
  { label: 'Submit', href: '/design-system/exhibits/tax', icon: FiFileText },
  { label: 'Audit', href: '/design-system/exhibits/tax', icon: FiShield },
  { label: 'Profile', href: '/design-system/exhibits/tax', icon: FiUser },
];
