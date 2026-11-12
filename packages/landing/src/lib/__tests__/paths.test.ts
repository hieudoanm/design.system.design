import { afterEach, describe, expect, it, vi } from 'vitest';

const loadPaths = async (basePath?: string) => {
  vi.resetModules();
  if (basePath === undefined) {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', undefined as unknown as string);
  } else {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', basePath);
  }
  return import('@/lib/paths');
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('basePath', () => {
  it('is empty when the environment variable is missing', async () => {
    const { basePath } = await loadPaths(undefined);
    expect(basePath).toBe('');
  });

  it('is read from NEXT_PUBLIC_BASE_PATH', async () => {
    const { basePath } = await loadPaths('/design.system.design');
    expect(basePath).toBe('/design.system.design');
  });
});

describe('withBasePath', () => {
  it('prefixes a root relative path', async () => {
    const { withBasePath } = await loadPaths('/design.system.design');
    expect(withBasePath('/icons/icon.svg')).toBe('/design.system.design/icons/icon.svg');
  });

  it('leaves the path alone when there is no base path', async () => {
    const { withBasePath } = await loadPaths('');
    expect(withBasePath('/icons/icon.svg')).toBe('/icons/icon.svg');
  });

  it('leaves a protocol relative url alone', async () => {
    const { withBasePath } = await loadPaths('/design.system.design');
    expect(withBasePath('//example.com/x')).toBe('//example.com/x');
  });

  it('leaves a relative path alone', async () => {
    const { withBasePath } = await loadPaths('/design.system.design');
    expect(withBasePath('icons/icon.svg')).toBe('icons/icon.svg');
  });

  it('leaves an absolute url alone', async () => {
    const { withBasePath } = await loadPaths('/design.system.design');
    expect(withBasePath('https://example.com/x')).toBe('https://example.com/x');
  });

  it('keeps the trailing slash of the root path', async () => {
    const { withBasePath } = await loadPaths('/design.system.design');
    expect(withBasePath('/')).toBe('/design.system.design/');
  });
});
