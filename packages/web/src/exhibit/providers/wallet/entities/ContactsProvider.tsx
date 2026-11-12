'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { contacts as seedContacts } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Contact } from '@/exhibit/types/wallet';

interface ContactsContextValue {
  contacts: Contact[];
  addContact: (contact: Contact) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  loading: boolean;
}

const ContactsContext = createContext<ContactsContextValue | null>(null);

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[ContactsProvider] render');
  const { data, setData, loading, persist, persistOne } =
    useEntitySync<Contact>(db.STORES.contacts, seedContacts);

  const addContact = useCallback(
    async (contact: Contact) => {
      console.log('[ContactsProvider] addContact', contact.id);
      const next = [...data, contact];
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  const updateContact = useCallback(
    async (updated: Contact) => {
      console.log('[ContactsProvider] updateContact', updated.id);
      setData(data.map((c) => (c.id === updated.id ? updated : c)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <ContactsContext.Provider
      value={{ contacts: data, addContact, updateContact, loading }}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContactsContext = (): ContactsContextValue => {
  const ctx = useContext(ContactsContext);
  if (!ctx)
    throw new Error('useContactsContext must be used within ContactsProvider');
  return ctx;
};
