/**
 * MCP server over stdio JSON-RPC for design.system.design.
 *
 * Exposes the site's content corpus — the markdown documents under
 * `src/content/md/` and the TypeScript content modules under
 * `src/content/ts/` — to MCP clients. Configure a client with:
 *
 *   "command": "node",
 *   "args": ["<repo>/packages/landing/scripts/ts/mcp-server.mts"]
 *
 * or run `pnpm --filter @dsd/landing mcp` from the repo root.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';

const landingRoot = resolve(import.meta.dirname, '../..');
const contentRoot = join(landingRoot, 'src', 'content');
const mdRoot = join(contentRoot, 'md');
const tsRoot = join(contentRoot, 'ts');
const siteConfig = JSON.parse(readFileSync(join(landingRoot, 'site.config.json'), 'utf8')) as {
  origin?: string;
  basePath?: string;
};

const SERVER_INFO = { name: 'dsd-mcp', version: '0.1.0' };
const PROTOCOL_VERSION = '2024-11-05';

type DocMeta = {
  path: string;
  section: string;
  title: string;
  difficulty?: string;
  tags: string[];
};

function walk(dir: string, ext: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, ext, out);
    else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

function parseMeta(file: string): DocMeta {
  const rel = file.slice(mdRoot.length + 1).replaceAll(sep, '/');
  const section = rel.split('/')[0] ?? '';
  const text = readFileSync(file, 'utf8');
  const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? basename(file, '.md');
  const difficulty = text.match(/\*\*Difficulty:\*\*\s*(.+)/)?.[1]?.trim();
  const tagsRaw = text.match(/\*\*Tags:\*\*\s*(.+)/)?.[1]?.trim() ?? '';
  return {
    path: rel.replace(/\.md$/, ''),
    section,
    title,
    difficulty,
    tags: tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

function allDocs(): DocMeta[] {
  return walk(mdRoot, '.md')
    .map(parseMeta)
    .sort((a, b) => a.path.localeCompare(b.path));
}

function resolveDocPath(requested: string): string | null {
  const rel = requested.replace(/^\/+/, '').replace(/\.md$/, '');
  if (rel.includes('..') || rel.startsWith('/')) return null;
  const file = join(mdRoot, `${rel}.md`);
  return file.startsWith(mdRoot + sep) && statSync(file, { throwIfNoEntry: false })?.isFile()
    ? file
    : null;
}

function listCategories(): unknown {
  const categories: { section: string; category: string; modules: number }[] = [];
  for (const section of readdirSync(tsRoot)) {
    const sectionDir = join(tsRoot, section);
    if (!statSync(sectionDir).isDirectory()) continue;
    for (const category of readdirSync(sectionDir)) {
      const dir = join(sectionDir, category);
      if (!statSync(dir).isDirectory()) continue;
      const modules = readdirSync(dir).filter(
        (f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts',
      ).length;
      categories.push({ section, category, modules });
    }
  }
  return { categories };
}

function searchDocuments(params: Record<string, unknown>): unknown {
  const query = String(params.query ?? '').toLowerCase();
  const section = params.section ? String(params.section) : null;
  const limit = Math.min(Number(params.limit ?? 20) || 20, 100);
  if (!query) return { error: 'query is required' };
  const results: { path: string; title: string; snippet: string }[] = [];
  for (const meta of allDocs()) {
    if (section && meta.section !== section) continue;
    const file = resolveDocPath(meta.path);
    if (!file) continue;
    const text = readFileSync(file, 'utf8');
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) continue;
    const start = Math.max(0, idx - 80);
    const snippet = text
      .slice(start, idx + query.length + 120)
      .replace(/\s+/g, ' ')
      .trim();
    results.push({ path: meta.path, title: meta.title, snippet: `…${snippet}…` });
    if (results.length >= limit) break;
  }
  return { query, count: results.length, results };
}

function readSource(params: Record<string, unknown>): unknown {
  const requested = String(params.path ?? '');
  const rel = requested.replace(/^\/+/, '');
  if (rel.includes('..')) return { error: 'invalid path' };
  const candidates = [join(tsRoot, rel), join(tsRoot, `${rel}.ts`), join(tsRoot, rel, 'index.ts')];
  const file = candidates.find((c) => statSync(c, { throwIfNoEntry: false })?.isFile());
  if (!file || !file.startsWith(tsRoot + sep)) return { error: `not found: ${requested}` };
  return { path: rel, content: readFileSync(file, 'utf8') };
}

function buildTools(): unknown {
  return {
    tools: [
      {
        name: 'site_info',
        description: 'Site metadata: origin, base path, content sections and document counts',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'list_documents',
        description:
          'List markdown documents (system-design problems and design-system chapters) with title, difficulty and tags',
        inputSchema: {
          type: 'object',
          properties: {
            section: {
              type: 'string',
              enum: ['design-system', 'system-design'],
              description: 'Restrict to one section',
            },
            query: {
              type: 'string',
              description: 'Case-insensitive filter on path, title or tags',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'read_document',
        description:
          'Read a markdown document by path relative to src/content/md (e.g. system-design/slack-messaging or design-system/colors)',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Document path without the .md extension' },
          },
          required: ['path'],
          additionalProperties: false,
        },
      },
      {
        name: 'search_documents',
        description:
          'Full-text search across all markdown documents; returns matching paths and snippets',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search text' },
            section: { type: 'string', enum: ['design-system', 'system-design'] },
            limit: { type: 'integer', description: 'Max results (default 20, max 100)' },
          },
          required: ['query'],
          additionalProperties: false,
        },
      },
      {
        name: 'list_categories',
        description:
          'List TypeScript content categories (e.g. system-design/search-media, design-system/foundations) with module counts',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      },
      {
        name: 'read_source',
        description:
          'Read a TypeScript content module under src/content/ts by path (e.g. system-design/foundations/rate-limiter)',
        inputSchema: {
          type: 'object',
          properties: { path: { type: 'string', description: 'Path relative to src/content/ts' } },
          required: ['path'],
          additionalProperties: false,
        },
      },
    ],
  };
}

function textResult(payload: unknown): unknown {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

function errorResult(message: string): unknown {
  return { content: [{ type: 'text', text: message }], isError: true };
}

function callTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case 'site_info': {
      const docs = allDocs();
      const bySection = docs.reduce<Record<string, number>>((acc, d) => {
        acc[d.section] = (acc[d.section] ?? 0) + 1;
        return acc;
      }, {});
      return textResult({
        name: 'design.system.design',
        origin: siteConfig.origin,
        basePath: siteConfig.basePath,
        sections: bySection,
        documents: docs.length,
      });
    }
    case 'list_documents': {
      const query = String(args.query ?? '').toLowerCase();
      const section = args.section ? String(args.section) : null;
      const docs = allDocs().filter(
        (d) =>
          (!section || d.section === section) &&
          (!query ||
            d.path.toLowerCase().includes(query) ||
            d.title.toLowerCase().includes(query) ||
            d.tags.some((t) => t.toLowerCase().includes(query))),
      );
      return textResult({ count: docs.length, documents: docs });
    }
    case 'read_document': {
      const file = resolveDocPath(String(args.path ?? ''));
      if (!file) return errorResult(`document not found: ${args.path}`);
      return textResult({ path: String(args.path), content: readFileSync(file, 'utf8') });
    }
    case 'search_documents':
      return textResult(searchDocuments(args));
    case 'list_categories':
      return textResult(listCategories());
    case 'read_source':
      return textResult(readSource(args));
    default:
      return errorResult(`Unknown tool: ${name}`);
  }
}

function handle(message: Record<string, unknown>): Record<string, unknown> | null {
  const id = message.id ?? null;
  const hasId = 'id' in message;
  const method = String(message.method ?? '');

  let result: unknown;
  switch (method) {
    case 'initialize':
      result = {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      };
      break;
    case 'ping':
      result = {};
      break;
    case 'tools/list':
      result = buildTools();
      break;
    case 'tools/call': {
      const params = (message.params ?? {}) as Record<string, unknown>;
      result = callTool(
        String(params.name ?? ''),
        (params.arguments ?? {}) as Record<string, unknown>,
      );
      break;
    }
    default:
      if (!hasId) return null;
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }

  if (!hasId) return null;
  return { jsonrpc: '2.0', id, result };
}

const rl = createInterface({ input: process.stdin, terminal: false });
for await (const line of rl) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  try {
    const message = JSON.parse(trimmed) as Record<string, unknown>;
    const response = handle(message);
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: `Parse error: ${error}` },
      })}\n`,
    );
  }
}
