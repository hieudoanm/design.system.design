'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiTrash2, FiX } from 'react-icons/fi';

type ModalKind = 'basic' | 'confirm' | 'form' | 'fullscreen' | null;

export const ModalsTemplate: FC = () => {
  const [openModal, setOpenModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [item, setItem] = useState('');

  const handleDelete = () => {
    setOpenModal(null);
    setToast('Item deleted');
  };

  const handleSave = () => {
    if (item.trim()) {
      setItems((prev) => [...prev, item]);
      setItem('');
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Modals
          </p>
          <h1>Modals showcase</h1>
          <p className="text-base-content/50 text-sm">
            State-driven DaisyUI modals.
          </p>
        </div>

        {toast && (
          <div className="alert alert-success gap-2">
            <FiCheckCircle className="h-5 w-5" />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenModal('basic')}>
            Basic modal
          </button>
          <button
            type="button"
            className="btn btn-warning"
            onClick={() => setOpenModal('confirm')}>
            Confirm modal
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setOpenModal('form')}>
            Form modal
          </button>
          <button
            type="button"
            className="btn btn-neutral"
            onClick={() => setOpenModal('fullscreen')}>
            Full-screen modal
          </button>
        </div>

        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-5">
          <h3 className="mb-3">Saved items</h3>
          {items.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {items.map((saved, i) => (
                <li
                  key={i}
                  className="bg-base-300/40 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                  <span>{saved}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${saved}`}
                    onClick={() =>
                      setItems(items.filter((_, idx) => idx !== i))
                    }
                    className="btn btn-ghost btn-xs">
                    <FiX className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base-content/50 text-sm">No saved items yet.</p>
          )}
        </div>

        {openModal === 'basic' && (
          <dialog open className="modal">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Basic modal</h3>
              <p className="py-4">This is a simple modal with a message.</p>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setOpenModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </dialog>
        )}

        {openModal === 'confirm' && (
          <dialog open className="modal">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Confirm modal</h3>
              <p className="py-4">Are you sure?</p>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpenModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-error gap-2"
                  onClick={handleDelete}>
                  <FiTrash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </dialog>
        )}

        {openModal === 'form' && (
          <dialog open className="modal">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Form modal</h3>
              <input
                className="input input-bordered mt-4 w-full"
                placeholder="Item name"
                value={item}
                onChange={(e) => setItem(e.target.value)}
              />
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setOpenModal(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </dialog>
        )}

        {openModal === 'fullscreen' && (
          <dialog open className="modal">
            <div className="modal-box h-full w-full">
              <h3 className="text-lg font-bold">Full-screen modal</h3>
              <p className="py-4">
                This modal fills the entire screen for immersive content.
              </p>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setOpenModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </dialog>
        )}
      </main>
    </div>
  );
};

ModalsTemplate.displayName = 'ModalsTemplate';
