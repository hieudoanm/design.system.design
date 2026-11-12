const toHex = (buffer: ArrayBuffer): string =>
  [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return toHex(array.buffer);
};

export const hashPassword = async (
  password: string,
  salt: string
): Promise<string> => {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
};

export const LOCK_FLAG_KEY = 'vault.locked';

export const isLockFlagSet = (): boolean =>
  typeof window !== 'undefined' &&
  window.localStorage.getItem(LOCK_FLAG_KEY) === '1';

export const setLockFlag = (): void => {
  window.localStorage.setItem(LOCK_FLAG_KEY, '1');
};

export const clearLockFlag = (): void => {
  window.localStorage.removeItem(LOCK_FLAG_KEY);
};
