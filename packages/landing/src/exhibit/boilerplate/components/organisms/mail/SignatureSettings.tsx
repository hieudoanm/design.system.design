'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface SignatureSettingsProps {
  name?: string;
  title?: string;
  signature?: string;
  onChange?: (payload: {
    name: string;
    title: string;
    signature: string;
  }) => void;
}

export const SignatureSettings: FC<SignatureSettingsProps> = ({
  name = '',
  title = '',
  signature = '',
  onChange,
}) => {
  const [draftName, setDraftName] = useState(name);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftSignature, setDraftSignature] = useState(signature);

  const save = (): void => {
    onChange?.({
      name: draftName,
      title: draftTitle,
      signature: draftSignature,
    });
  };

  return (
    <div
      className="bg-base-200 border-base-content/10 flex w-full flex-col gap-4 rounded-xl border p-4"
      data-testid="signature-settings">
      <h3 className="text-sm font-medium">Email signature</h3>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          aria-label="Signature name"
          className="input input-bordered input-sm w-full"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          aria-label="Signature title"
          className="input input-bordered input-sm w-full"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Signature text</span>
        </label>
        <textarea
          value={draftSignature}
          onChange={(e) => setDraftSignature(e.target.value)}
          aria-label="Signature text"
          className="textarea textarea-bordered h-24 w-full resize-none"
        />
      </div>
      <div className="border-base-content/10 border-t pt-3">
        <p className="text-base-content/50 mb-1 text-xs">Preview</p>
        <div
          data-testid="signature-preview"
          className="bg-base-100 border-base-content/10 rounded-lg border p-3 text-sm">
          <p className="font-medium">{draftName || '—'}</p>
          <p className="text-base-content/50">{draftTitle || '—'}</p>
          <p className="text-base-content/60 mt-1 whitespace-pre-line">
            {draftSignature || '—'}
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={save} className="btn btn-primary btn-sm">
          Save signature
        </button>
      </div>
    </div>
  );
};

SignatureSettings.displayName = 'SignatureSettings';
