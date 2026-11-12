import {
  FiHome,
  FiDollarSign,
  FiList,
  FiSend,
  FiCreditCard,
  FiBarChart2,
  FiSmartphone,
  FiFileText,
  FiRepeat,
  FiBell,
  FiUser,
  FiSettings,
  FiUsers,
  FiPieChart,
  FiArrowUpRight,
  FiRepeat as FiRecurring,
  FiAlertTriangle,
  FiGrid,
  FiTrendingUp,
  FiLock,
  FiTarget,
  FiShield,
  FiGift,
  FiDownload,
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

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/design-system/exhibits/wallet', icon: FiHome }],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Accounts', href: '/design-system/exhibits/wallet', icon: FiDollarSign },
      { label: 'Transactions', href: '/design-system/exhibits/wallet', icon: FiList },
      { label: 'Reports', href: '/design-system/exhibits/wallet', icon: FiPieChart },
      { label: 'Exchange', href: '/design-system/exhibits/wallet', icon: FiRepeat },
    ],
  },
  {
    label: 'Payments',
    items: [
      { label: 'Transfer', href: '/design-system/exhibits/wallet', icon: FiSend },
      { label: 'Contacts', href: '/design-system/exhibits/wallet', icon: FiUsers },
      {
        label: 'Payment Requests',
        href: '/design-system/exhibits/wallet',
        icon: FiArrowUpRight,
      },
      { label: 'Split Bill', href: '/design-system/exhibits/wallet', icon: FiGrid },
      { label: 'Cards', href: '/design-system/exhibits/wallet', icon: FiCreditCard },
      { label: 'Pay', href: '/design-system/exhibits/wallet', icon: FiSmartphone },
    ],
  },
  {
    label: 'Banking',
    items: [
      { label: 'Loans', href: '/design-system/exhibits/wallet', icon: FiTrendingUp },
      { label: 'Fixed Deposits', href: '/design-system/exhibits/wallet', icon: FiLock },
      {
        label: 'Recurring Deposits',
        href: '/design-system/exhibits/wallet',
        icon: FiRepeat,
      },
      { label: 'Savings Goals', href: '/design-system/exhibits/wallet', icon: FiTarget },
      { label: 'Insurance', href: '/design-system/exhibits/wallet', icon: FiShield },
      { label: 'Card Rewards', href: '/design-system/exhibits/wallet', icon: FiGift },
    ],
  },
  {
    label: 'Budgeting',
    items: [
      { label: 'Budget', href: '/design-system/exhibits/wallet', icon: FiBarChart2 },
      { label: 'Bills', href: '/design-system/exhibits/wallet', icon: FiFileText },
      {
        label: 'Recurring',
        href: '/design-system/exhibits/wallet',
        icon: FiRecurring,
      },
      {
        label: 'Currency Alerts',
        href: '/design-system/exhibits/wallet',
        icon: FiAlertTriangle,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Notifications', href: '/design-system/exhibits/wallet', icon: FiBell },
      { label: 'Profile', href: '/design-system/exhibits/wallet', icon: FiUser },
      { label: 'Settings', href: '/design-system/exhibits/wallet', icon: FiSettings },
      { label: 'Downloads', href: '/design-system/exhibits', icon: FiDownload },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

export const bottomNavItems: NavItem[] = [
  { label: 'Home', href: '/design-system/exhibits/wallet', icon: FiHome },
  { label: 'Accounts', href: '/design-system/exhibits/wallet', icon: FiDollarSign },
  { label: 'Pay', href: '/design-system/exhibits/wallet', icon: FiSmartphone },
  { label: 'Cards', href: '/design-system/exhibits/wallet', icon: FiCreditCard },
  { label: 'More', href: '/design-system/exhibits/wallet', icon: FiUser },
];
