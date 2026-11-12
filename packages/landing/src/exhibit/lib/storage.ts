const PREFIX = 'pos_';

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PREFIX + key);
  },

  keys(): string[] {
    if (typeof window === 'undefined') return [];
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) {
        result.push(key.slice(PREFIX.length));
      }
    }
    return result;
  },
};
