'use client';

import { type FC, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FiBell,
  FiBellOff,
  FiLock,
  FiGlobe,
  FiHelpCircle,
  FiFileText,
  FiShield,
} from 'react-icons/fi';

const LANGUAGES = ['English', 'Vietnamese', 'Japanese', 'French', 'German'];

const loadSetting = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  const result = stored !== null ? stored === 'true' : fallback;
  console.log('[Settings] loadSetting', { key, result });
  return result;
};

const saveSetting = (key: string, value: boolean): void => {
  console.log('[Settings] saveSetting', { key, value });
  localStorage.setItem(key, String(value));
};

const SettingsSection: FC = () => {
  const [pushEnabled, setPushEnabled] = useState(() =>
    loadSetting('wallet-push-notifications', true)
  );
  const [biometricEnabled, setBiometricEnabled] = useState(() =>
    loadSetting('wallet-biometric', true)
  );
  const [language, setLanguage] = useState(() =>
    loadSetting('wallet-lang-index', false) ? LANGUAGES[0] : 'English'
  );
  const [langOpen, setLangOpen] = useState(false);

  const togglePush = useCallback(() => {
    setPushEnabled((prev) => {
      saveSetting('wallet-push-notifications', !prev);
      return !prev;
    });
  }, []);

  const toggleBiometric = useCallback(() => {
    setBiometricEnabled((prev) => {
      saveSetting('wallet-biometric', !prev);
      return !prev;
    });
  }, []);

  const selectLanguage = useCallback((lang: string) => {
    console.log('[Settings] selectLanguage', lang);
    setLanguage(lang);
    setLangOpen(false);
  }, []);

  return (
    <>
      <div className="card bg-base-200 shadow-md">
        <div className="card-body divide-base-300 gap-0 divide-y">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {pushEnabled ? <FiBell /> : <FiBellOff />}
              <span>Push Notifications</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={pushEnabled}
              onChange={togglePush}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <FiLock />
              <span>Biometric Login</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={biometricEnabled}
              onChange={toggleBiometric}
            />
          </div>

          <div className="relative flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <FiGlobe />
              <span>Language</span>
            </div>
            <button
              type="button"
              className="text-base-content/60 btn btn-neutral btn-sm"
              onClick={() => setLangOpen((prev) => !prev)}>
              {language} ▾
            </button>
            {langOpen && (
              <div className="bg-base-100 border-base-300 absolute top-full right-0 z-10 mt-1 w-40 rounded-lg border shadow-lg">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`hover:bg-base-200 block w-full px-4 py-2 text-left text-sm ${
                      language === lang ? 'text-primary font-medium' : ''
                    }`}
                    onClick={() => selectLanguage(lang)}>
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-md">
        <div className="card-body divide-base-300 gap-0 divide-y">
          <Link
            href="/design-system/exhibits/wallet"
            className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <FiHelpCircle />
              <span>Help & Support</span>
            </div>
            <span className="text-base-content/60">›</span>
          </Link>

          <Link
            href="/design-system/exhibits/wallet"
            className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <FiFileText />
              <span>Terms of Service</span>
            </div>
            <span className="text-base-content/60">›</span>
          </Link>

          <Link
            href="/design-system/exhibits/wallet"
            className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <FiShield />
              <span>Privacy Policy</span>
            </div>
            <span className="text-base-content/60">›</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default SettingsSection;
