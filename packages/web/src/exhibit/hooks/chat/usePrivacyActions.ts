import { useCallback } from 'react';
import type {
  Contact,
  PrivacySettings,
  DeviceTrustEntry,
  VerificationCode,
  SpamReport,
} from '@/exhibit/types/chat';
import {
  generateKeyPair,
  generateVerificationCode,
  hashPin,
  verifyPin,
} from '@/exhibit/lib/chat/crypto';

interface UsePrivacyActionsParams {
  privacySettings: PrivacySettings;
  setPrivacySettings: React.Dispatch<React.SetStateAction<PrivacySettings>>;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setSpamReports: React.Dispatch<React.SetStateAction<SpamReport[]>>;
  setDeviceTrustList: React.Dispatch<React.SetStateAction<DeviceTrustEntry[]>>;
  setActiveVerification: React.Dispatch<
    React.SetStateAction<VerificationCode | null>
  >;
  setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const usePrivacyActions = ({
  privacySettings,
  setPrivacySettings,
  setContacts,
  setSpamReports,
  setDeviceTrustList,
  setActiveVerification,
  setIsLocked,
}: UsePrivacyActionsParams) => {
  const updatePrivacySettings = useCallback(
    async (partial: Partial<PrivacySettings>) => {
      setPrivacySettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const blockContact = useCallback(async (contactId: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      blockedContactIds: [...new Set([...prev.blockedContactIds, contactId])],
    }));
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, blocked: true } : c))
    );
  }, []);

  const unblockContact = useCallback(async (contactId: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      blockedContactIds: prev.blockedContactIds.filter(
        (id) => id !== contactId
      ),
    }));
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, blocked: false } : c))
    );
  }, []);

  const reportSpam = useCallback(
    async (contactId: string, reason: string) => {
      const report: SpamReport = { contactId, reason, reportedAt: Date.now() };
      setSpamReports((prev) => [...prev, report]);
      await blockContact(contactId);
    },
    [blockContact]
  );

  const addTrustedDevice = useCallback(
    async (device: Omit<DeviceTrustEntry, 'trustedAt'>) => {
      const entry: DeviceTrustEntry = { ...device, trustedAt: Date.now() };
      setDeviceTrustList((prev) => [
        ...prev.filter((d) => d.deviceId !== device.deviceId),
        entry,
      ]);
    },
    []
  );

  const removeTrustedDevice = useCallback(async (deviceId: string) => {
    setDeviceTrustList((prev) => prev.filter((d) => d.deviceId !== deviceId));
  }, []);

  const verifyDevice = useCallback(async (deviceId: string) => {
    setDeviceTrustList((prev) =>
      prev.map((d) => (d.deviceId === deviceId ? { ...d, verified: true } : d))
    );
  }, []);

  const startVerification = useCallback(
    async (chatId: string): Promise<VerificationCode> => {
      const myKeys = await generateKeyPair();
      const peerKeys = await generateKeyPair();
      const code = await generateVerificationCode(
        myKeys.publicKey,
        peerKeys.publicKey
      );
      const verification: VerificationCode = {
        chatId,
        code,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      setActiveVerification(verification);
      return verification;
    },
    []
  );

  const clearVerification = useCallback(() => {
    setActiveVerification(null);
  }, []);

  const isPinValid = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!privacySettings.pinHash) return false;
      return verifyPin(pin, privacySettings.pinHash);
    },
    [privacySettings.pinHash]
  );

  const setPin = useCallback(async (pin: string) => {
    const hashed = await hashPin(pin);
    setPrivacySettings((prev) => ({
      ...prev,
      pinEnabled: true,
      pinHash: hashed,
    }));
    setIsLocked(false);
  }, []);

  const unlockPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const valid = await isPinValid(pin);
      if (valid) setIsLocked(false);
      return valid;
    },
    [isPinValid]
  );

  return {
    updatePrivacySettings,
    blockContact,
    unblockContact,
    reportSpam,
    addTrustedDevice,
    removeTrustedDevice,
    verifyDevice,
    startVerification,
    clearVerification,
    isPinValid,
    setPin,
    unlockPin,
  };
};
