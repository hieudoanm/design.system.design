'use client';

import { type FC, useState } from 'react';
import { useData } from '@/exhibit/providers/password/DataProvider';
import { useSecurity } from '@/exhibit/providers/password/SecurityProvider';
import { useToast } from '@/exhibit/providers/password/ToastProvider';
import { FiCheck, FiKey, FiLock, FiX } from 'react-icons/fi';
import { generateSalt, hashPassword } from '@/exhibit/lib/password/security';

export const MasterPasswordCard: FC = () => {
  const { settings, updateSettings } = useData();
  const { lock } = useSecurity();
  const { addToast } = useToast();
  const [mpNew, setMpNew] = useState('');
  const [mpConfirm, setMpConfirm] = useState('');
  const [mpCurrent, setMpCurrent] = useState('');

  const configured = Boolean(
    settings.masterPasswordHash && settings.masterPasswordSalt
  );

  const applyMasterPassword = async (newPassword: string): Promise<void> => {
    const salt = generateSalt();
    const hash = await hashPassword(newPassword, salt);
    await updateSettings({
      masterPasswordHash: hash,
      masterPasswordSalt: salt,
    });
  };

  const handleSet = async (): Promise<void> => {
    if (!mpNew || mpNew !== mpConfirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    await applyMasterPassword(mpNew);
    setMpNew('');
    setMpConfirm('');
    addToast('Master password set', 'success');
  };

  const handleChange = async (): Promise<void> => {
    if (!mpCurrent || !mpNew || mpNew !== mpConfirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    const currentHash = await hashPassword(
      mpCurrent,
      settings.masterPasswordSalt as string
    );
    if (currentHash !== settings.masterPasswordHash) {
      addToast('Current password incorrect', 'error');
      return;
    }
    await applyMasterPassword(mpNew);
    setMpNew('');
    setMpConfirm('');
    setMpCurrent('');
    addToast('Master password updated', 'success');
  };

  const handleRemove = async (): Promise<void> => {
    await updateSettings({
      masterPasswordHash: undefined,
      masterPasswordSalt: undefined,
    });
    setMpCurrent('');
    addToast('Master password removed', 'info');
  };

  const inputCls = 'input input-bordered w-full';

  return (
    <div className="card bg-base-200 card-body">
      <h2 className="card-title">Master Password</h2>
      {configured ? (
        <>
          <p className="flex items-center gap-2 text-sm">
            <FiCheck className="text-success" /> Master password enabled
          </p>
          <input
            type="password"
            aria-label="Current master password"
            placeholder="Current password"
            value={mpCurrent}
            onChange={(e) => setMpCurrent(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            aria-label="New master password"
            placeholder="New password"
            value={mpNew}
            onChange={(e) => setMpNew(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            aria-label="Confirm new master password"
            placeholder="Confirm new password"
            value={mpConfirm}
            onChange={(e) => setMpConfirm(e.target.value)}
            className={inputCls}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleChange()}
              disabled={!mpCurrent || !mpNew}
              className="btn btn-primary btn-sm">
              <FiKey className="size-4" /> Change
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              className="btn btn-ghost btn-sm text-error">
              <FiX className="size-4" /> Remove
            </button>
            <button
              type="button"
              onClick={lock}
              className="btn btn-ghost btn-sm">
              <FiLock className="size-4" /> Lock now
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="password"
            aria-label="New master password"
            placeholder="New password"
            value={mpNew}
            onChange={(e) => setMpNew(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            aria-label="Confirm new master password"
            placeholder="Confirm new password"
            value={mpConfirm}
            onChange={(e) => setMpConfirm(e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => void handleSet()}
            disabled={!mpNew}
            className="btn btn-primary btn-sm w-fit">
            <FiKey className="size-4" /> Set Master Password
          </button>
        </>
      )}
    </div>
  );
};
