'use client';

import { type FC, useRef, useState } from 'react';
import { FiDownload, FiUpload } from 'react-icons/fi';
import {
  buildExportCsv,
  buildVaultJson,
  downloadFile,
  encryptJson,
  parseCsvToItems,
  parseJsonToItems,
} from '@/exhibit/lib/password/transfer';
import type { VaultItem } from '@/exhibit/types/password';

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });

interface TransferCardProps {
  items: VaultItem[];
  onImport: (
    list: Array<Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  notify: (message: string, type: 'success' | 'error') => void;
}

export const TransferCard: FC<TransferCardProps> = ({
  items,
  onImport,
  notify,
}) => {
  const csvRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const [passphrase, setPassphrase] = useState('');

  const handleCsv = async (file: File): Promise<void> => {
    try {
      const parsed = parseCsvToItems(await readFile(file));
      if (parsed.length === 0) throw new Error('No items found in CSV');
      await onImport(parsed);
      notify(`Imported ${parsed.length} item(s)`, 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'CSV import failed', 'error');
    }
  };

  const handleJson = async (file: File): Promise<void> => {
    try {
      const parsed = parseJsonToItems(await readFile(file));
      if (parsed.length === 0) throw new Error('No items found in JSON');
      await onImport(parsed);
      notify(`Imported ${parsed.length} item(s)`, 'success');
    } catch (err) {
      notify(
        err instanceof Error ? err.message : 'JSON import failed',
        'error'
      );
    }
  };

  const handleExportEncrypted = (): void => {
    if (!passphrase.trim()) {
      notify('Enter a passphrase to encrypt the export', 'error');
      return;
    }
    downloadFile(
      'vault-export.json.enc',
      encryptJson(buildVaultJson(items), passphrase),
      'application/octet-stream'
    );
    notify('Encrypted vault exported', 'success');
  };

  return (
    <div className="card bg-base-200 card-body">
      <h2 className="card-title">Import / Export</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-base-content/60 text-sm">Import from file</p>
          <div>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="file-input file-input-sm file-input-bordered w-full"
              aria-label="Import CSV"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCsv(file);
                if (csvRef.current) csvRef.current.value = '';
              }}
            />
          </div>
          <div>
            <input
              ref={jsonRef}
              type="file"
              accept=".json,application/json"
              className="file-input file-input-sm file-input-bordered w-full"
              aria-label="Import JSON"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleJson(file);
                if (jsonRef.current) jsonRef.current.value = '';
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-base-content/60 text-sm">Export vault</p>
          <button
            type="button"
            onClick={() => {
              downloadFile(
                'vault-export.csv',
                buildExportCsv(items),
                'text/csv'
              );
              notify('Plain CSV exported', 'success');
            }}
            className="btn btn-sm w-full">
            <FiDownload className="size-4" /> Export CSV
          </button>
          <input
            type="password"
            placeholder="Export passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
          <button
            type="button"
            onClick={handleExportEncrypted}
            className="btn btn-sm w-full">
            <FiDownload className="size-4" /> Export encrypted JSON
          </button>
        </div>
      </div>
      <p className="text-base-content/40 mt-1 text-xs">
        CSV columns: type, title, username, password, url, notes, tags
      </p>
      <p className="text-base-content/40 flex items-center gap-1 text-xs">
        <FiUpload className="size-3" /> Encrypted exports use a mock XOR cipher
        for the demo.
      </p>
    </div>
  );
};
