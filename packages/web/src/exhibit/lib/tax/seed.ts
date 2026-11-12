import { db } from './db';
import {
  MOCK_USERS,
  MOCK_COMPANIES,
  MOCK_SUBMISSIONS,
  MOCK_AUDITS,
} from '@/exhibit/data/tax/mock';

let seedPromise: Promise<void> | null = null;

const seedDatabase = async (): Promise<void> => {
  console.log('[seed] seeding database');

  await db.putAll(db.STORES.user, MOCK_USERS);
  await db.putAll(db.STORES.companies, MOCK_COMPANIES);
  await db.putAll(db.STORES.submissions, MOCK_SUBMISSIONS);
  await db.putAll(db.STORES.audits, MOCK_AUDITS);

  console.log('[seed] seeding complete');
};

export const ensureSeeded = async (): Promise<void> => {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const needs = await db.needsSeed();
    if (needs) {
      await seedDatabase();
    }
  })();

  return seedPromise;
};
