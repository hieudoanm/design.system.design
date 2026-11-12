import type { VaultItem } from '@/exhibit/types/password';
import { checkStrength } from '@/exhibit/data/password/models';

export interface ReusedGroup {
  password: string;
  count: number;
  items: VaultItem[];
}

export interface HealthReport {
  total: number;
  strong: number;
  weak: number;
  weakItems: VaultItem[];
  score: number;
  reused: ReusedGroup[];
  breached: VaultItem[];
  old: VaultItem[];
}

export type SuggestionSeverity = 'high' | 'medium' | 'low';

export interface Suggestion {
  title: string;
  reason: string;
  severity: SuggestionSeverity;
}

const day = 86400000;
const OLD_PASSWORD_DAYS = 90;
const TREND_KEY = 'vault-health-trend';
const TREND_MAX = 14;

export const MOCK_BREACHED_PASSWORDS: readonly string[] = [
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'letmein',
  'admin',
  'welcome',
  'iloveyou',
  'monkey',
  'dragon',
  'master',
  'P@ssw0rd',
  'Password1',
];

const withPassword = (items: VaultItem[]): VaultItem[] =>
  items.filter((i) => i.password);

export const getReusedGroups = (items: VaultItem[]): ReusedGroup[] => {
  const byPassword = new Map<string, VaultItem[]>();
  for (const item of withPassword(items)) {
    const list = byPassword.get(item.password!) ?? [];
    list.push(item);
    byPassword.set(item.password!, list);
  }
  return [...byPassword.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([password, list]) => ({ password, count: list.length, items: list }))
    .sort((a, b) => b.count - a.count);
};

export const getBreached = (items: VaultItem[]): VaultItem[] =>
  withPassword(items).filter((i) =>
    MOCK_BREACHED_PASSWORDS.includes(i.password!)
  );

export const getOld = (items: VaultItem[]): VaultItem[] =>
  withPassword(items).filter(
    (i) => Date.now() - i.updatedAt > OLD_PASSWORD_DAYS * day
  );

export const analyzeHealth = (items: VaultItem[]): HealthReport => {
  const usable = withPassword(items);
  const strong = usable.filter((i) => checkStrength(i.password!).score >= 4);
  const weak = usable.filter((i) => checkStrength(i.password!).score <= 2);
  return {
    total: usable.length,
    strong: strong.length,
    weak: weak.length,
    weakItems: weak,
    score:
      usable.length === 0
        ? 100
        : Math.round((strong.length / usable.length) * 100),
    reused: getReusedGroups(items),
    breached: getBreached(items),
    old: getOld(items),
  };
};

export const getSuggestions = (report: HealthReport): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  for (const group of report.reused) {
    suggestions.push({
      title: `Reused password on ${group.count} items`,
      reason: `The same password is used by ${group.items
        .map((i) => i.title)
        .join(
          ', '
        )}. Use a unique password for each site so one breach cannot chain.`,
      severity: 'high',
    });
  }
  for (const item of report.breached) {
    suggestions.push({
      title: `Breached password on ${item.title}`,
      reason:
        'This password appears in known data breaches. Change it immediately.',
      severity: 'high',
    });
  }
  for (const item of report.old) {
    suggestions.push({
      title: `Password older than 90 days on ${item.title}`,
      reason:
        'Rotate long-lived passwords regularly to limit exposure over time.',
      severity: 'medium',
    });
  }
  for (const item of report.weakItems) {
    suggestions.push({
      title: `Weak password on ${item.title}`,
      reason: 'Use the generator to create a longer, more complex password.',
      severity: 'low',
    });
  }
  return suggestions;
};

interface TrendPoint {
  date: string;
  score: number;
}

const todayKey = (): string => new Date().toISOString().slice(0, 10);

export const readHealthTrend = (): number[] => {
  try {
    const raw = localStorage.getItem(TREND_KEY);
    if (!raw) return [];
    const history: TrendPoint[] = JSON.parse(raw);
    if (!Array.isArray(history)) return [];
    return history.map((h) => h.score);
  } catch {
    return [];
  }
};

export const recordHealthScore = (score: number): number[] => {
  let history: TrendPoint[] = [];
  try {
    const raw = localStorage.getItem(TREND_KEY);
    if (raw) {
      const parsed: TrendPoint[] = JSON.parse(raw);
      if (Array.isArray(parsed)) history = parsed;
    }
  } catch {
    history = [];
  }
  const today = todayKey();
  const existing = history.findIndex((h) => h.date === today);
  if (existing >= 0) {
    history[existing] = { date: today, score };
  } else {
    history.push({ date: today, score });
  }
  if (history.length > TREND_MAX) history = history.slice(-TREND_MAX);
  try {
    localStorage.setItem(TREND_KEY, JSON.stringify(history));
  } catch {
    /* storage unavailable */
  }
  return history.map((h) => h.score);
};
