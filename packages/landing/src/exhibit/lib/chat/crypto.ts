const b64Encode = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const b64Decode = (b64: string): ArrayBuffer => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export interface CryptoKeyPair {
  publicKey: string;
  privateKey: string;
}

export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );
  const pubRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privRaw = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  return {
    publicKey: b64Encode(pubRaw),
    privateKey: b64Encode(privRaw),
  };
};

const importPublicKey = async (b64: string): Promise<CryptoKey> => {
  const raw = b64Decode(b64);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
};

const importPrivateKey = async (b64: string): Promise<CryptoKey> => {
  const raw = b64Decode(b64);
  return crypto.subtle.importKey(
    'pkcs8',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveKey', 'deriveBits']
  );
};

export const deriveSharedKey = async (
  privateKeyB64: string,
  publicKeyB64: string
): Promise<CryptoKey> => {
  const privateKey = await importPrivateKey(privateKeyB64);
  const publicKey = await importPublicKey(publicKeyB64);
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

const IV_LENGTH = 12;

export const encrypt = async (
  plaintext: string,
  sharedKeyB64: string
): Promise<string> => {
  const key = await importSharedAesKey(sharedKeyB64);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  const combined = new Uint8Array(
    iv.length + new Uint8Array(ciphertext).length
  );
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return b64Encode(combined.buffer);
};

export const decrypt = async (
  ciphertextB64: string,
  sharedKeyB64: string
): Promise<string> => {
  const key = await importSharedAesKey(sharedKeyB64);
  const combined = new Uint8Array(b64Decode(ciphertextB64));
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plainBuf);
};

const importSharedAesKey = async (b64: string): Promise<CryptoKey> => {
  const raw = b64Decode(b64);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const exportSharedKey = async (key: CryptoKey): Promise<string> => {
  const raw = await crypto.subtle.exportKey('raw', key);
  return b64Encode(raw);
};

export const generateVerificationCode = async (
  publicKeyA: string,
  publicKeyB: string
): Promise<string> => {
  const sorted = [publicKeyA, publicKeyB].sort();
  const data = new TextEncoder().encode(sorted.join(':'));
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hash = new Uint8Array(hashBuf);
  const digits = Array.from(hash.slice(0, 6))
    .map((b) => (b % 10).toString())
    .join('');
  return digits;
};

export const getDeviceFingerprint = (): string => {
  const ua = navigator.userAgent;
  const lang = navigator.language;
  const cores = navigator.hardwareConcurrency ?? 0;
  const screen = `${window.screen.width}x${window.screen.height}`;
  return `${ua}|${lang}|${cores}|${screen}`;
};

export const hashPin = async (pin: string): Promise<string> => {
  const data = new TextEncoder().encode(`pin-salt-${pin}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return b64Encode(hashBuf);
};

export const verifyPin = async (
  pin: string,
  hash: string
): Promise<boolean> => {
  const computed = await hashPin(pin);
  return computed === hash;
};
