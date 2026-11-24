'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiChevronRight,
  FiEdit2,
  FiHome,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiShoppingCart,
  FiTrash2,
} from 'react-icons/fi';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: '1',
    name: 'Jane Doe',
    street: '123 Main St',
    city: 'San Francisco',
    phone: '+1 555-0101',
    isDefault: true,
  },
  {
    id: '2',
    name: 'John Smith',
    street: '456 Oak Ave',
    city: 'Portland',
    phone: '+1 555-0102',
    isDefault: false,
  },
];

let nextAddressId = 3;

const blankForm = { name: '', street: '', city: '' };

export const AddressBookTemplate: FC = () => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  const openAdd = () => {
    setName(blankForm.name);
    setStreet(blankForm.street);
    setCity(blankForm.city);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const address = addresses.find((item) => item.id === id);
    if (!address) return;
    setName(address.name);
    setStreet(address.street);
    setCity(address.city);
    setEditingId(id);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveAddress = () => {
    if (editingId) {
      setAddresses((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, name, street, city } : item
        )
      );
    } else {
      setAddresses((prev) => [
        ...prev,
        {
          id: String(nextAddressId++),
          name,
          street,
          city,
          phone: '+1 555-0000',
          isDefault: prev.length === 0,
        },
      ]);
    }
    closeModal();
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => {
      const target = prev.find((item) => item.id === id);
      let next = prev.filter((item) => item.id !== id);
      if (target?.isDefault && next.length > 0) {
        next = next.map((item, index) =>
          index === 0 ? { ...item, isDefault: true } : item
        );
      }
      return next;
    });
  };

  const setDefault = (id: string) =>
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store/cart" className="btn btn-ghost btn-sm">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/store"
              className="text-base-content/50 hover:text-primary transition-colors">
              Store
            </Link>
            <FiChevronRight className="text-base-content/30 h-3 w-3" />
            <span>Address book ({addresses.length})</span>
          </div>
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1">
            <FiPlus className="h-3 w-3" />
            Add address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-24 text-center">
            <FiMapPin className="text-base-content/20 h-12 w-12" />
            <p className="text-base-content/50 text-sm">
              No saved addresses yet
            </p>
            <button onClick={openAdd} className="btn btn-primary btn-sm">
              Add your first address
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border-base-content/10 bg-base-200 rounded-xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                      <FiHome className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{address.name}</p>
                        {address.isDefault && (
                          <span className="badge badge-primary badge-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-base-content/50 text-sm">
                        {address.street}
                      </p>
                      <p className="text-base-content/50 text-sm">
                        {address.city}
                      </p>
                      <p className="text-base-content/50 flex items-center gap-1 text-sm">
                        <FiPhone className="h-3 w-3" />
                        {address.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(address.id)}
                        className="btn btn-ghost btn-xs gap-1">
                        <FiEdit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(address.id)}
                        className="btn btn-ghost btn-xs text-error gap-1">
                        <FiTrash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefault(address.id)}
                        className="btn btn-ghost btn-xs gap-1">
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              {editingId ? 'Edit address' : 'Add address'}
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered"
                  placeholder="Full name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Street</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="input input-bordered"
                  placeholder="Street address"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input input-bordered"
                  placeholder="City"
                />
              </div>
            </div>
            <div className="modal-action">
              <button onClick={saveAddress} className="btn btn-primary">
                Save
              </button>
              <button onClick={closeModal} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-primary text-lg font-bold tracking-tight">
            Boilerplate
          </p>
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate Store &middot; Built
            with care
          </p>
        </div>
      </footer>
    </div>
  );
};

AddressBookTemplate.displayName = 'AddressBookTemplate';
