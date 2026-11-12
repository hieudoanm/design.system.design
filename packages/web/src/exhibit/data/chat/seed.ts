import { db } from '@/exhibit/lib/chat/db';
import {
  ME,
  MOCK_CONTACTS,
  MOCK_CHATS,
  MOCK_MESSAGES,
} from '@/exhibit/data/chat/models';

export const seedDatabase = async (): Promise<void> => {
  const existing = await db.chats.getAll();
  if (existing.length > 0) return;

  await db.account.put(ME);
  for (const contact of MOCK_CONTACTS) {
    await db.contacts.put(contact);
  }
  for (const chat of MOCK_CHATS) {
    await db.chats.put(chat);
  }
  for (const message of MOCK_MESSAGES) {
    await db.messages.put(message);
  }
};

export { generateId } from '@/exhibit/data/chat/models';
