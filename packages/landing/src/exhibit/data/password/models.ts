import type { Folder, VaultItem } from '@/exhibit/types/password';

const now = Date.now();
const day = 86400000;

export const MOCK_FOLDERS: Folder[] = [
  { id: 'f-work', name: 'Work', createdAt: now - day * 90 },
  { id: 'f-personal', name: 'Personal', createdAt: now - day * 60 },
  { id: 'f-finance', name: 'Finance', createdAt: now - day * 30 },
  { id: 'f-team', name: 'Marketing', isTeam: true, createdAt: now - day * 20 },
];

export const MOCK_ITEMS: VaultItem[] = [
  {
    id: 'v-1',
    type: 'login',
    title: 'GitHub',
    username: 'user@gmail.com',
    password: 'Sup3r!Secret',
    url: 'https://github.com',
    favorite: true,
    tags: ['dev', 'work'],
    folderId: 'f-work',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    createdAt: now - day * 30,
    updatedAt: now - day * 5,
    lastUsed: now - 3600000,
  },
  {
    id: 'v-2',
    type: 'login',
    title: 'Google',
    username: 'user@gmail.com',
    password: 'G00gl3Pass!',
    url: 'https://google.com',
    favorite: true,
    tags: ['personal'],
    folderId: 'f-personal',
    createdAt: now - day * 60,
    updatedAt: now - day * 10,
    lastUsed: now - 7200000,
  },
  {
    id: 'v-3',
    type: 'login',
    title: 'Twitter',
    username: '@user',
    password: 'Tw1tter#2024',
    url: 'https://twitter.com',
    favorite: false,
    tags: ['social'],
    createdAt: now - day * 20,
    updatedAt: now - day * 3,
    lastUsed: now - 86400000,
  },
  {
    id: 'v-4',
    type: 'card',
    title: 'Visa ending 4242',
    cardNumber: '4242424242424242',
    cardholder: 'John Doe',
    expiry: '12/28',
    cvv: '123',
    password: '',
    favorite: false,
    tags: ['finance'],
    folderId: 'f-finance',
    createdAt: now - day * 90,
    updatedAt: now - day * 90,
  },
  {
    id: 'v-5',
    type: 'card',
    title: 'Mastercard ending 8888',
    cardNumber: '5555555555558888',
    cardholder: 'John Doe',
    expiry: '06/27',
    cvv: '456',
    password: '',
    favorite: false,
    tags: ['finance'],
    createdAt: now - day * 45,
    updatedAt: now - day * 45,
  },
  {
    id: 'v-6',
    type: 'identity',
    title: 'Personal Identity',
    username: 'john.doe@email.com',
    password: '',
    notes: 'Full name: John Doe\nPhone: +1 555-0123',
    favorite: true,
    tags: ['personal'],
    createdAt: now - day * 120,
    updatedAt: now - day * 120,
  },
  {
    id: 'v-7',
    type: 'note',
    title: 'WiFi Password',
    notes: 'Home: MyW1f1P@ss\nOffice: 0ff1c3!Secure',
    password: '',
    favorite: false,
    tags: ['home'],
    createdAt: now - day * 15,
    updatedAt: now - day * 2,
  },
  {
    id: 'v-8',
    type: 'login',
    title: 'AWS Console',
    username: 'admin@company.com',
    password: 'Aws!C0ns0le#2024',
    url: 'https://aws.amazon.com',
    favorite: false,
    tags: ['work', 'dev'],
    folderId: 'f-work',
    createdAt: now - day * 10,
    updatedAt: now - day * 1,
    lastUsed: now - 1800000,
  },
  {
    id: 'v-9',
    type: 'ssh',
    title: 'Production Server',
    username: 'deploy',
    notes: 'Key: ssh-rsa AAAA...',
    password: 'K3yP@ss!2024',
    favorite: false,
    tags: ['work', 'devops'],
    folderId: 'f-work',
    createdAt: now - day * 25,
    updatedAt: now - day * 8,
  },
  {
    id: 'v-10',
    type: 'login',
    title: 'Netflix',
    username: 'user@gmail.com',
    password: 'N3tfl1x!Pass',
    url: 'https://netflix.com',
    favorite: false,
    tags: ['entertainment'],
    createdAt: now - day * 40,
    updatedAt: now - day * 20,
    lastUsed: now - 172800000,
  },
  {
    id: 'v-11',
    type: 'login',
    title: 'LinkedIn',
    username: 'john.doe@email.com',
    password: 'L1nked!n#2024',
    url: 'https://linkedin.com',
    favorite: false,
    tags: ['work', 'social'],
    createdAt: now - day * 35,
    updatedAt: now - day * 4,
  },
  {
    id: 'v-12',
    type: 'login',
    title: 'Dropbox',
    username: 'user@gmail.com',
    password: 'Dr0pb0x!Pass',
    url: 'https://dropbox.com',
    favorite: true,
    tags: ['cloud'],
    createdAt: now - day * 70,
    updatedAt: now - day * 12,
    lastUsed: now - 259200000,
  },
  {
    id: 'v-13',
    type: 'login',
    title: 'Slack',
    username: 'john@company.com',
    password: 'S1ack!Team#2024',
    url: 'https://slack.com',
    favorite: false,
    tags: ['work', 'dev'],
    createdAt: now - day * 18,
    updatedAt: now - day * 1,
  },
  {
    id: 'v-14',
    type: 'login',
    title: 'Amazon',
    username: 'john.doe@email.com',
    password: 'Am@zon!Shop24',
    url: 'https://amazon.com',
    favorite: true,
    tags: ['shopping'],
    createdAt: now - day * 55,
    updatedAt: now - day * 15,
    lastUsed: now - 604800000,
  },
  {
    id: 'v-15',
    type: 'card',
    title: 'Amex ending 3001',
    cardNumber: '378282246310005',
    cardholder: 'John Doe',
    expiry: '09/27',
    cvv: '8910',
    password: '',
    favorite: false,
    tags: ['finance'],
    createdAt: now - day * 80,
    updatedAt: now - day * 80,
  },
  {
    id: 'v-16',
    type: 'login',
    title: 'PayPal',
    username: 'john.doe@email.com',
    password: 'P@yP@l!Secure#24',
    url: 'https://paypal.com',
    favorite: false,
    tags: ['finance', 'shopping'],
    createdAt: now - day * 65,
    updatedAt: now - day * 6,
  },
  {
    id: 'v-17',
    type: 'identity',
    title: 'Driver License',
    username: 'john.doe@email.com',
    password: '',
    notes: 'Full name: John Doe\nLicense number: D12345678\nState: California',
    favorite: false,
    tags: ['personal'],
    createdAt: now - day * 200,
    updatedAt: now - day * 200,
  },
  {
    id: 'v-18',
    type: 'identity',
    title: 'Passport',
    username: 'john.doe@email.com',
    password: '',
    notes: 'Full name: John Doe\nPassport number: P98765432\nCountry: USA',
    favorite: false,
    tags: ['personal', 'travel'],
    createdAt: now - day * 365,
    updatedAt: now - day * 30,
  },
  {
    id: 'v-19',
    type: 'note',
    title: 'Software Licenses',
    notes: 'Photoshop: XXXX-XXXX-XXXX-1234\nWebStorm: YYYY-YYYY-YYYY-5678',
    password: '',
    favorite: false,
    tags: ['work'],
    createdAt: now - day * 95,
    updatedAt: now - day * 5,
  },
  {
    id: 'v-20',
    type: 'note',
    title: 'Insurance Policy',
    notes: 'Policy number: INS-2024-554433\nProvider: Secure Life Co.',
    password: '',
    favorite: true,
    tags: ['home', 'finance'],
    createdAt: now - day * 150,
    updatedAt: now - day * 22,
  },
  {
    id: 'v-21',
    type: 'ssh',
    title: 'Staging Server',
    username: 'deploy',
    password: 'St@ging#2024',
    notes: 'Host: staging.example.com\nKey: ssh-ed25519 AAAA...',
    favorite: false,
    tags: ['work', 'devops'],
    createdAt: now - day * 12,
    updatedAt: now - day * 2,
  },
  {
    id: 'v-22',
    type: 'ssh',
    title: 'Home Server',
    username: 'pi',
    password: 'H0me!S3rver',
    notes: 'Host: 192.168.1.10\nKey: ssh-rsa AAAA...',
    favorite: false,
    tags: ['home', 'devops'],
    createdAt: now - day * 45,
    updatedAt: now - day * 9,
  },
  {
    id: 'v-23',
    type: 'login',
    title: 'Spotify',
    username: 'john.doe@email.com',
    password: 'Sp0t1fy!Music',
    url: 'https://spotify.com',
    favorite: false,
    tags: ['entertainment'],
    createdAt: now - day * 28,
    updatedAt: now - day * 11,
    lastUsed: now - 43200000,
  },
  {
    id: 'v-24',
    type: 'login',
    title: 'Outlook',
    username: 'john.doe@company.com',
    password: '0utl00k!W0rk',
    url: 'https://outlook.com',
    favorite: true,
    tags: ['work', 'personal'],
    createdAt: now - day * 85,
    updatedAt: now - day * 3,
    lastUsed: now - 21600000,
  },
  {
    id: 'v-25',
    type: 'login',
    title: 'Reddit',
    username: 'john.doe@email.com',
    password: 'Sp0t1fy!Music',
    url: 'https://reddit.com',
    favorite: false,
    tags: ['social'],
    createdAt: now - day * 50,
    updatedAt: now - day * 7,
  },
  {
    id: 'v-26',
    type: 'login',
    title: 'Discord',
    username: 'john.doe@email.com',
    password: 'Sp0t1fy!Music',
    url: 'https://discord.com',
    favorite: false,
    tags: ['social'],
    createdAt: now - day * 44,
    updatedAt: now - day * 6,
  },
  {
    id: 'v-27',
    type: 'login',
    title: 'Old Forum',
    username: 'john.doe@email.com',
    password: 'password',
    url: 'https://forum.example.com',
    favorite: false,
    tags: ['personal'],
    createdAt: now - day * 130,
    updatedAt: now - day * 130,
  },
  {
    id: 'v-28',
    type: 'login',
    title: 'Legacy Mail',
    username: 'john.doe@email.com',
    password: 'L3gacy!Mail#2019',
    url: 'https://legacymail.example.com',
    favorite: false,
    tags: ['personal', 'old'],
    createdAt: now - day * 700,
    updatedAt: now - day * 400,
  },
  {
    id: 'v-29',
    type: 'login',
    title: 'Client Portal',
    username: 'you@client.com',
    password: 'Cl!ent#2024',
    url: 'https://portal.client.com',
    favorite: false,
    tags: ['work', 'shared'],
    sharedBy: 'manager@company.com',
    sharedWith: [{ email: 'you@example.com', permission: 'view' }],
    createdAt: now - day * 14,
    updatedAt: now - day * 2,
  },
  {
    id: 'v-30',
    type: 'login',
    title: 'Team Wiki',
    username: 'wiki@company.com',
    password: 'W1ki!Team#2024',
    url: 'https://wiki.company.com',
    favorite: true,
    tags: ['work', 'shared'],
    folderId: 'f-team',
    sharedWith: [{ email: 'teammate@company.com', permission: 'edit' }],
    accessLog: [
      { action: 'copy', timestamp: now - 3600000, detail: 'Password' },
      { action: 'view', timestamp: now - 7200000 },
      {
        action: 'share',
        timestamp: now - day * 3,
        detail: 'teammate@company.com',
      },
    ],
    createdAt: now - day * 16,
    updatedAt: now - day * 1,
    lastUsed: now - 3600000,
  },
];

export const generatePassword = (
  length: number,
  options: {
    upper: boolean;
    lower: boolean;
    numbers: boolean;
    symbols: boolean;
  }
): string => {
  let chars = '';
  if (options.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

export const checkStrength = (
  password: string
): { score: number; label: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return { score: Math.min(score, 5), label: labels[Math.min(score, 5)] };
};

export const generatePin = (length: number): string => {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) result += String(array[i] % 10);
  return result;
};

export const MEMORABLE_WORDS = [
  'apple',
  'banana',
  'cherry',
  'dragon',
  'ember',
  'falcon',
  'glacier',
  'harbor',
  'island',
  'jaguar',
  'kettle',
  'lagoon',
  'magnet',
  'nectar',
  'ocean',
  'pebble',
  'quartz',
  'river',
  'summit',
  'tundra',
  'umbrella',
  'valley',
  'willow',
  'yonder',
  'zephyr',
  'breeze',
  'crystal',
  'forest',
  'garden',
  'horizon',
  'lantern',
  'meadow',
  'night',
  'orchid',
  'pioneer',
] as const;

export const generateMemorablePassword = (
  wordCount: number,
  separator = '-'
): string => {
  const count = Math.min(Math.max(wordCount, 3), 10);
  const array = new Uint32Array(count);
  crypto.getRandomValues(array);
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(MEMORABLE_WORDS[array[i] % MEMORABLE_WORDS.length]);
  }
  return words.join(separator);
};
