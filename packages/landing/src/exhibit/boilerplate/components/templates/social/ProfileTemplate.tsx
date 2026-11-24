'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiLock,
  FiBell,
  FiAlertTriangle,
  FiSave,
  FiCamera,
} from 'react-icons/fi';
import { FiHome, FiSettings, FiInfo, FiClock } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: <FiHome /> },
  { label: 'About', href: '/shared/about', icon: <FiInfo /> },
  { label: 'Settings', href: '/app/settings', icon: <FiSettings /> },
  { label: 'Version', href: '/app/version', icon: <FiClock /> },
];

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Section: FC<SectionProps> = ({ title, description, children }) => (
  <div className="flex flex-col gap-4">
    <div>
      <h2 className="text-base-content text-lg">{title}</h2>
      {description && (
        <p className="text-base-content/50 text-sm">{description}</p>
      )}
    </div>
    <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
      {children}
    </div>
  </div>
);

interface ProfileTemplateProps {
  userName?: string;
  userEmail?: string;
  memberSince?: string;
}

export const ProfileTemplate: FC<ProfileTemplateProps> = ({
  userName = 'Guest User',
  userEmail = 'guest@example.com',
  memberSince = 'January 2024',
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    weekly: true,
    product: false,
  });

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const notifItems = [
    {
      key: 'email' as const,
      label: 'Send email notifications',
      description: 'Get notified via email for important updates.',
    },
    {
      key: 'weekly' as const,
      label: 'Weekly digest',
      description: 'Receive a weekly summary of your activity.',
    },
    {
      key: 'product' as const,
      label: 'Product updates',
      description: 'Learn about new features and improvements.',
    },
  ];

  return (
    <PageShell title="Profile" backHref="/" gap="gap-8" navItems={NAV_ITEMS}>
      {/* Avatar row */}
      <div className="flex items-center gap-5">
        <div className="bg-primary/10 text-primary relative flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
          {initials}
          <button
            className="bg-base-100 border-base-content/10 absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border"
            title="Change avatar">
            <FiCamera size={12} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{userName}</h1>
          <p className="text-base-content/50 text-sm">{userEmail}</p>
          <p className="text-base-content/40 mt-0.5 text-xs">
            Member since {memberSince}
          </p>
        </div>
      </div>

      <Section
        title="Account settings"
        description="Update your name and email address.">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <div className="relative">
              <FiUser className="text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                id="name"
                type="text"
                className="input input-bordered w-full pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <FiMail className="text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                className="input input-bordered w-full pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm">
          <FiSave />
          Save changes
        </button>
      </Section>

      <Section
        title="Change password"
        description="Set a new password for your account.">
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="current-password" className="text-sm font-medium">
              Current password
            </label>
            <div className="relative">
              <FiLock className="text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full pl-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="new-password" className="text-sm font-medium">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                className="input input-bordered w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm">
          <FiLock />
          Update password
        </button>
      </Section>

      <Section
        title="Notifications"
        description="Choose what updates you receive.">
        <div className="flex flex-col gap-3">
          {notifItems.map(({ key, label, description }) => (
            <label
              key={key}
              className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
                className="checkbox checkbox-primary checkbox-sm mt-0.5"
              />
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-base-content/50 text-xs">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      <Section
        title="Danger zone"
        description="Irreversible actions for your account.">
        <p className="text-base-content/50 mb-4 text-sm leading-relaxed">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button className="btn btn-error btn-sm">
          <FiAlertTriangle />
          Delete account
        </button>
      </Section>
    </PageShell>
  );
};

ProfileTemplate.displayName = 'ProfileTemplate';
