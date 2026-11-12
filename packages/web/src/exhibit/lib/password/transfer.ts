import type { VaultItem, VaultItemType } from '@/exhibit/types/password';

const VALID_TYPES: VaultItemType[] = [
  'login',
  'card',
  'identity',
  'note',
  'ssh',
];

const escapeCsv = (value?: string): string =>
  `"${(value ?? '').replace(/"/g, '""')}"`;

const parseCsvRow = (line: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
};

const asType = (value: string): VaultItemType =>
  VALID_TYPES.includes(value as VaultItemType)
    ? (value as VaultItemType)
    : 'login';

const optString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
};

const toItem = (
  data: Record<string, unknown>,
  index: number
): Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'> => {
  if (!data || typeof data !== 'object' || !data.title) {
    throw new Error(`Row ${index + 1} is missing a title`);
  }
  const tags = Array.isArray(data.tags)
    ? data.tags.map(String)
    : String(data.tags ?? '')
        .split(';')
        .filter(Boolean);
  return {
    type: asType(String(data.type ?? 'login')),
    title: String(data.title),
    username: optString(data.username),
    password: optString(data.password),
    url: optString(data.url),
    notes: optString(data.notes),
    favorite: Boolean(data.favorite),
    tags,
  };
};

export const parseCsvToItems = (
  csv: string
): Array<Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>> => {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvRow(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line, i) => {
    const cells = parseCsvRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').trim();
    });
    return toItem(row, i);
  });
};

export const buildExportCsv = (items: VaultItem[]): string => {
  const headers = [
    'type',
    'title',
    'username',
    'password',
    'url',
    'notes',
    'tags',
  ];
  const rows = items.map((i) =>
    [
      i.type,
      i.title,
      i.username ?? '',
      i.password ?? '',
      i.url ?? '',
      (i.notes ?? '').replace(/\n/g, ' '),
      (i.tags ?? []).join(';'),
    ]
      .map(escapeCsv)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const parseJsonToItems = (
  json: string
): Array<Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>> => {
  const data = JSON.parse(json);
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];
  return list.map((raw: unknown, i: number) =>
    toItem(raw as Record<string, unknown>, i)
  );
};

export const buildVaultJson = (items: VaultItem[]): string =>
  JSON.stringify(
    {
      format: 'password-vault',
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    },
    null,
    2
  );

const xorWithKey = (text: string, key: string): string => {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return out;
};

export const encryptJson = (json: string, passphrase: string): string =>
  btoa(xorWithKey(encodeURIComponent(json), passphrase));

export const decryptJson = (encoded: string, passphrase: string): string =>
  decodeURIComponent(xorWithKey(atob(encoded), passphrase));

export const downloadFile = (
  filename: string,
  content: string,
  mime: string
): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
