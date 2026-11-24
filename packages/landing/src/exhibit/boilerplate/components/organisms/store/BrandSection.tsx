import type { FC } from 'react';

interface Brand {
  id: string;
  name: string;
  tagline?: string;
  featured?: boolean;
}

interface BrandSectionProps {
  brands: Brand[];
}

export const BrandSection: FC<BrandSectionProps> = ({ brands }) => {
  return (
    <section data-testid="brand-section" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Shop by brand</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <article
            key={brand.id}
            className={`card ${brand.featured ? 'bg-primary' : 'bg-base-200'}`}>
            <div
              className={`card-body items-center gap-2 p-4 text-center ${
                brand.featured ? 'text-primary-content' : ''
              }`}>
              <span className="text-3xl" aria-hidden="true">
                &#9670;
              </span>
              <h3 className="text-sm font-medium">{brand.name}</h3>
              {brand.tagline && (
                <p className="text-xs opacity-70">{brand.tagline}</p>
              )}
              {brand.featured && (
                <span className="badge badge-ghost">Featured</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
