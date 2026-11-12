'use client';

import { type FC, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { FiCopy, FiRefreshCw, FiSmartphone } from 'react-icons/fi';
import {
  generateTotp,
  getTotpRemainingSeconds,
  otpauthUri,
  TOTP_PERIOD_SECONDS,
} from '@/exhibit/lib/password/totp';
import { copyToClipboard } from '@/exhibit/utils/password/format';

interface TotpDisplayProps {
  secret: string;
  account: string;
  issuer?: string;
}

export const TotpDisplay: FC<TotpDisplayProps> = ({
  secret,
  account,
  issuer,
}) => {
  const [code, setCode] = useState('······');
  const [remaining, setRemaining] = useState(TOTP_PERIOD_SECONDS);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = (): void => {
    void generateTotp(secret).then(setCode);
    setRemaining(getTotpRemainingSeconds());
  };

  useEffect(() => {
    refresh();
    const tick = window.setInterval(() => {
      const left = getTotpRemainingSeconds();
      setRemaining(left);
      if (left === TOTP_PERIOD_SECONDS - 1) refresh();
    }, 1000);
    return () => window.clearInterval(tick);
  }, [secret]);

  const handleCopy = async (): Promise<void> => {
    await copyToClipboard(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleShowQr = async (): Promise<void> => {
    if (qrUrl) {
      setQrUrl(null);
      return;
    }
    const uri = otpauthUri(secret, account, issuer);
    setQrUrl(await QRCode.toDataURL(uri, { width: 160 }));
  };

  return (
    <div className="card bg-base-200 card-body p-4">
      <div className="flex items-center justify-between">
        <label className="text-base-content/50 text-xs">
          Two-factor authentication
        </label>
        <button
          type="button"
          onClick={() => void handleShowQr()}
          className="btn btn-ghost btn-xs"
          aria-label="Show QR code">
          <FiSmartphone className="size-3" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="flex-1 font-mono text-3xl tracking-widest"
          data-testid="totp-code">
          {code}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="btn btn-ghost btn-xs"
          aria-label="Copy code">
          <FiCopy className="size-3" /> {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={refresh}
          className="btn btn-ghost btn-xs"
          aria-label="Refresh code">
          <FiRefreshCw className="size-3" />
        </button>
      </div>
      <div className="bg-base-300 mt-2 h-1.5 w-full overflow-hidden rounded">
        <div
          className="bg-success h-full rounded transition-all duration-1000 ease-linear"
          style={{ width: `${(remaining / TOTP_PERIOD_SECONDS) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs opacity-50">Code expires in {remaining}s</p>
      {qrUrl && (
        <div className="mt-3 flex justify-center">
          <img
            src={qrUrl}
            alt="TOTP QR code"
            className="h-40 w-40 rounded-lg"
            data-testid="totp-qr"
          />
        </div>
      )}
    </div>
  );
};
