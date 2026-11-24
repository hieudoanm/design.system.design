'use client';

import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { FiClock, FiHome, FiInfo, FiSettings } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: <FiHome /> },
  { label: 'About', href: '/shared/about', icon: <FiInfo /> },
  { label: 'Settings', href: '/app/settings', icon: <FiSettings /> },
  { label: 'Version', href: '/app/version', icon: <FiClock /> },
];

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const SettingRow: FC<SettingRowProps> = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col">
      <span className="text-base-content text-sm font-medium">{label}</span>
      {description && (
        <span className="text-base-content/50 text-xs">{description}</span>
      )}
    </div>
    {children}
  </div>
);

interface SettingSectionProps {
  title: string;
  children: ReactNode;
}

const SettingSection: FC<SettingSectionProps> = ({ title, children }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-base-content/50 text-xs tracking-[0.2em] uppercase">
      {title}
    </h2>
    <div className="border-base-content/10 bg-base-200 rounded-2xl border p-4">
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  </div>
);

interface SettingsTemplateProps {
  language: string;
  theme: string;
  dateTimeFormat: string;
  timezone: string;
  onLanguageChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onDateTimeFormatChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export const SettingsTemplate: FC<SettingsTemplateProps> = ({
  language,
  theme,
  dateTimeFormat,
  timezone,
  onLanguageChange,
  onThemeChange,
  onDateTimeFormatChange,
  onTimezoneChange,
}) => {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <PageShell title="Settings" backHref="/" navItems={NAV_ITEMS}>
      <SettingSection title="Language">
        <SettingRow
          label="Language"
          description="Select your preferred language">
          <select
            className="select select-bordered select-sm w-40"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}>
            <option value="en">English</option>
            <option value="vi">Tieng Viet</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Appearance">
        <SettingRow label="Theme" description="Choose your color theme">
          <select
            className="select select-bordered select-sm w-40"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}>
            <option value="nothing">Nothing</option>
            <optgroup label="Light">
              <option value="light">Light</option>
              <option value="cupcake">Cupcake</option>
              <option value="bumblebee">Bumblebee</option>
              <option value="emerald">Emerald</option>
              <option value="corporate">Corporate</option>
              <option value="garden">Garden</option>
              <option value="aqua">Aqua</option>
              <option value="lofi">Lofi</option>
              <option value="pastel">Pastel</option>
              <option value="fantasy">Fantasy</option>
              <option value="lemonade">Lemonade</option>
              <option value="winter">Winter</option>
              <option value="autumn">Autumn</option>
              <option value="nord">Nord</option>
              <option value="retro">Retro</option>
            </optgroup>
            <optgroup label="Dark">
              <option value="dark">Dark</option>
              <option value="night">Night</option>
              <option value="dim">Dim</option>
              <option value="forest">Forest</option>
              <option value="black">Black</option>
              <option value="luxury">Luxury</option>
              <option value="dracula">Dracula</option>
              <option value="coffee">Coffee</option>
              <option value="sunset">Sunset</option>
              <option value="synthwave">Synthwave</option>
              <option value="halloween">Halloween</option>
            </optgroup>
            <optgroup label="Vibrant">
              <option value="cyberpunk">Cyberpunk</option>
              <option value="valentine">Valentine</option>
              <option value="wireframe">Wireframe</option>
              <option value="cmyk">CMYK</option>
              <option value="business">Business</option>
              <option value="acid">Acid</option>
            </optgroup>
          </select>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Date & Time">
        <SettingRow
          label="Date/Time Format"
          description="How dates and times are displayed">
          <select
            className="select select-bordered select-sm w-40"
            value={dateTimeFormat}
            onChange={(e) => onDateTimeFormatChange(e.target.value)}>
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
            <option value="iso">ISO 8601</option>
            <option value="relative">Relative</option>
          </select>
        </SettingRow>

        <SettingRow label="Timezone" description="Your local timezone">
          <select
            className="select select-bordered select-sm w-40"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Los_Angeles">Pacific (PT)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Seoul">Seoul (KST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Asia/Ho_Chi_Minh">Ho Chi Minh (ICT)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </SettingRow>
      </SettingSection>
    </PageShell>
  );
};

SettingsTemplate.displayName = 'SettingsTemplate';
