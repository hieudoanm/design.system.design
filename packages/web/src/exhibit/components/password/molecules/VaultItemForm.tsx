'use client';

import { type FC, useState } from 'react';
import { FiEye, FiEyeOff, FiPlus, FiX } from 'react-icons/fi';
import type { CustomField, VaultItem, VaultItemType } from '@/exhibit/types/password';

type ItemFormData = Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>;

interface VaultItemFormProps {
  initial?: VaultItem | null;
  submitLabel?: string;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: Array<{ value: VaultItemType; label: string }> = [
  { value: 'login', label: 'Login' },
  { value: 'card', label: 'Card' },
  { value: 'identity', label: 'Identity' },
  { value: 'note', label: 'Secure Note' },
  { value: 'ssh', label: 'SSH Key' },
];

const Label: FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-base-content/60 mb-1 block text-xs">{children}</label>
);

export const VaultItemForm: FC<VaultItemFormProps> = ({
  initial,
  submitLabel = 'Create',
  onSubmit,
  onCancel,
}) => {
  const [type, setType] = useState<VaultItemType>(initial?.type ?? 'login');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [password, setPassword] = useState(initial?.password ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [cardholder, setCardholder] = useState(initial?.cardholder ?? '');
  const [cardNumber, setCardNumber] = useState(initial?.cardNumber ?? '');
  const [expiry, setExpiry] = useState(initial?.expiry ?? '');
  const [cvv, setCvv] = useState(initial?.cvv ?? '');
  const [totpSecret, setTotpSecret] = useState(initial?.totpSecret ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initial?.customFields ?? []
  );
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const cleanedFields = customFields
      .filter((f) => f.key.trim())
      .map((f) => ({ key: f.key.trim(), value: f.value.trim() }));
    const data: ItemFormData = {
      type,
      title: title.trim(),
      favorite: initial?.favorite ?? false,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (cleanedFields.length > 0) data.customFields = cleanedFields;
    if (username.trim()) data.username = username.trim();
    if (password) data.password = password;
    if (url.trim()) data.url = url.trim();
    if (cardholder.trim()) data.cardholder = cardholder.trim();
    if (cardNumber.trim()) data.cardNumber = cardNumber.trim();
    if (expiry.trim()) data.expiry = expiry.trim();
    if (cvv.trim()) data.cvv = cvv.trim();
    if (totpSecret.trim()) data.totpSecret = totpSecret.trim().toUpperCase();
    if (notes.trim()) data.notes = notes.trim();
    onSubmit(data);
  };

  const showUsername =
    type === 'login' || type === 'identity' || type === 'ssh';
  const showPasswordField = type === 'login' || type === 'ssh';
  const showUrl = type === 'login';
  const showCard = type === 'card';

  return (
    <div className="space-y-3">
      <div>
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as VaultItemType)}
          disabled={Boolean(initial)}
          aria-label="Item type"
          className="select select-bordered w-full">
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Title</Label>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      {showUsername && (
        <div>
          <Label>Username</Label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
      )}
      {showPasswordField && (
        <div>
          <Label>Password</Label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-ghost btn-xs absolute top-1/2 right-1 -translate-y-1/2"
              aria-label="Toggle password visibility">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
      )}
      {showUrl && (
        <div>
          <Label>URL</Label>
          <input
            type="text"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
      )}
      {showUrl && (
        <div>
          <Label>TOTP Secret</Label>
          <input
            type="text"
            placeholder="Base32 secret (optional)"
            value={totpSecret}
            onChange={(e) => setTotpSecret(e.target.value)}
            className="input input-bordered w-full"
          />
          <p className="text-base-content/50 mt-1 text-xs">
            e.g. JBSWY3DPEHPK3PXP
          </p>
        </div>
      )}
      {showCard && (
        <>
          <div>
            <Label>Cardholder</Label>
            <input
              type="text"
              placeholder="Cardholder"
              value={cardholder}
              onChange={(e) => setCardholder(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <Label>Card Number</Label>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label>Expiry</Label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex-1">
              <Label>CVV</Label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </>
      )}
      <div>
        <Label>Notes</Label>
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="textarea textarea-bordered w-full"
          rows={3}
        />
      </div>
      <div>
        <Label>Tags</Label>
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="label">
          <span className="label-text text-xs">Custom fields</span>
        </label>
        <div className="space-y-2">
          {customFields.map((field, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="Key"
                value={field.key}
                onChange={(e) =>
                  setCustomFields((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, key: e.target.value } : f
                    )
                  )
                }
                className="input input-bordered w-1/3"
              />
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) =>
                  setCustomFields((prev) =>
                    prev.map((f, i) =>
                      i === idx ? { ...f, value: e.target.value } : f
                    )
                  )
                }
                className="input input-bordered w-full"
              />
              <button
                type="button"
                aria-label="Remove custom field"
                onClick={() =>
                  setCustomFields((prev) => prev.filter((_, i) => i !== idx))
                }
                className="btn btn-ghost btn-sm btn-circle">
                <FiX className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setCustomFields((prev) => [...prev, { key: '', value: '' }])
            }
            className="btn btn-ghost btn-sm">
            <FiPlus className="size-4" /> Add field
          </button>
        </div>
      </div>
      <div className="card-actions justify-end">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </div>
  );
};
