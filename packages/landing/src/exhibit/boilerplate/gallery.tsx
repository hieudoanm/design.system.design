'use client';

import type { FC } from 'react';
import { Suspense, useState } from 'react';
import { boilerplateNamespaces, type BoilerplateNamespace } from './registry';
import { boilerplateRoutes } from './routes';
import { boilerplateScreens } from './screens';
import { BoilerplateNavContext } from './nav';
import { templateProps, screenOverrides } from './props';

/*
 * The boilerplate is a component library, not an app: 16 namespaces of
 * atoms/molecules/organisms composed into template screens. The gallery
 * treats each route the original app exposed as one screen — pick a
 * namespace, pick a screen, and the kit's own sidebar links navigate
 * between them through the Link shim in ./link.tsx.
 */

interface Selection {
  ns: string;
  slug: string;
}

const pathFor = (ns: BoilerplateNamespace, slug: string): string =>
  slug === 'index' ? `/${ns.id}` : `/${ns.id}/${slug}`;

const screens = boilerplateScreens as unknown as Record<
  string,
  Record<string, FC<Record<string, unknown>>>
>;

const BoilerplateGallery: FC = () => {
  const [selection, setSelection] = useState<Selection>({
    ns: boilerplateNamespaces[0].id,
    slug: boilerplateNamespaces[0].templates[0].slug,
  });

  const ns = boilerplateNamespaces.find((n) => n.id === selection.ns) ?? boilerplateNamespaces[0];
  const entry = ns.templates.find((t) => t.slug === selection.slug) ?? ns.templates[0];
  const pathname = pathFor(ns, entry.slug);

  const navigate = (path: string) => {
    const route = boilerplateRoutes[path] ?? matchDynamic(path);
    if (!route || !boilerplateNamespaces.some((n) => n.id === route.ns)) return;
    setSelection({ ns: route.ns, slug: route.slug });
  };

  const Screen = screenOverrides[ns.id]?.[entry.slug] ?? screens[ns.id]?.[entry.exportName];
  const props = templateProps[ns.id]?.[entry.slug];

  return (
    <BoilerplateNavContext.Provider value={{ pathname, navigate }}>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-mute font-mono text-xs tracking-wide uppercase'>Namespace</span>
          <div className='flex flex-wrap gap-1'>
            {boilerplateNamespaces.map((n) => (
              <button
                key={n.id}
                type='button'
                onClick={() => setSelection({ ns: n.id, slug: n.templates[0].slug })}
                className={`rounded-full border px-3 py-1 font-mono text-xs transition ${
                  n.id === ns.id
                    ? 'border-marker bg-marker/10 text-marker'
                    : 'border-ink/15 text-mute hover:border-ink/40'
                }`}>
                {n.label}
              </button>
            ))}
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-mute font-mono text-xs tracking-wide uppercase'>Screen</span>
          <select
            value={entry.slug}
            onChange={(e) => setSelection({ ns: ns.id, slug: e.target.value })}
            className='border-ink/15 bg-paper text-ink rounded-md border px-2 py-1 font-mono text-xs'>
            {ns.templates.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
          <span className='text-mute font-mono text-xs'>{pathname}</span>
        </div>
        <div className='border-ink/15 max-h-[75vh] overflow-auto rounded-lg border'>
          <Suspense
            fallback={
              <div className='text-mute flex h-48 items-center justify-center text-sm'>
                Loading screen…
              </div>
            }>
            {Screen ? (
              <Screen {...(props ?? {})} />
            ) : (
              <MissingScreen ns={ns.id} slug={entry.slug} />
            )}
          </Suspense>
        </div>
      </div>
    </BoilerplateNavContext.Provider>
  );
};

const MissingScreen: FC<{ ns: string; slug: string }> = ({ ns, slug }) => (
  <div className='text-mute flex h-48 items-center justify-center text-sm'>
    No screen registered for {ns}/{slug}.
  </div>
);

/* Dynamic routes like /blog/[slug] also answer concrete paths such as
 * /blog/getting-started — match segment-wise when the literal lookup fails. */
const dynamicPatterns = Object.entries(boilerplateRoutes)
  .filter(([path]) => path.includes('['))
  .map(([path, route]) => ({
    pattern: new RegExp(`^${path.replace(/\[[^\]]+\]/g, '[^/]+')}$`),
    route,
  }));

const matchDynamic = (path: string) =>
  dynamicPatterns.find(({ pattern }) => pattern.test(path))?.route;

export default BoilerplateGallery;
