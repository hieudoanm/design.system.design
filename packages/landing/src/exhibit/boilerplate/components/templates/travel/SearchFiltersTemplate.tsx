'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiFilter, FiMapPin, FiSearch, FiSliders } from 'react-icons/fi';

interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  beds: number;
  type: 'House' | 'Condo' | 'Townhouse';
}

const PROPERTIES: Property[] = [
  {
    id: 'r1',
    name: 'Maple Grove Family Home',
    location: 'Maple Grove',
    price: 845000,
    beds: 4,
    type: 'House',
  },
  {
    id: 'r2',
    name: 'Riverside Condo',
    location: 'Riverside',
    price: 520000,
    beds: 2,
    type: 'Condo',
  },
  {
    id: 'r3',
    name: 'Downtown Penthouse',
    location: 'Downtown',
    price: 1280000,
    beds: 3,
    type: 'Condo',
  },
  {
    id: 'r4',
    name: 'Lakeside Cottage',
    location: 'Lakeview',
    price: 390000,
    beds: 2,
    type: 'House',
  },
  {
    id: 'r5',
    name: 'Birchwood Estate',
    location: 'Birchwood Hills',
    price: 1950000,
    beds: 6,
    type: 'House',
  },
  {
    id: 'r6',
    name: 'Sunset Terrace Townhome',
    location: 'Sunset Terrace',
    price: 610000,
    beds: 3,
    type: 'Townhouse',
  },
  {
    id: 'r7',
    name: 'Riverbend Duplex',
    location: 'Riverside',
    price: 540000,
    beds: 3,
    type: 'Townhouse',
  },
  {
    id: 'r8',
    name: 'Riverside Loft',
    location: 'Riverside',
    price: 480000,
    beds: 1,
    type: 'Condo',
  },
  {
    id: 'r9',
    name: 'Downtown Studio',
    location: 'Downtown',
    price: 350000,
    beds: 1,
    type: 'Condo',
  },
  {
    id: 'r10',
    name: 'Maple Grove Cottage',
    location: 'Maple Grove',
    price: 425000,
    beds: 2,
    type: 'House',
  },
  {
    id: 'r11',
    name: 'Birchwood Bungalow',
    location: 'Birchwood Hills',
    price: 690000,
    beds: 3,
    type: 'House',
  },
  {
    id: 'r12',
    name: 'Sunset Terrace Condo',
    location: 'Sunset Terrace',
    price: 380000,
    beds: 2,
    type: 'Condo',
  },
];

const PRICE_OPTIONS = ['Any price', 'Under $500K', '$500K - $1M', 'Over $1M'];
const BED_OPTIONS = ['Any beds', '2+ beds', '3+ beds', '4+ beds'];
const TYPE_OPTIONS = ['Any type', 'House', 'Condo', 'Townhouse'];

const formatPrice = (price: number) => `$${price.toLocaleString('en-US')}`;

export const SearchFiltersTemplate: FC = () => {
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('Any price');
  const [beds, setBeds] = useState('Any beds');
  const [type, setType] = useState('Any type');
  const [results, setResults] = useState<Property[]>(PROPERTIES);

  const applyFilters = () => {
    const query = location.trim().toLowerCase();
    const minBeds = beds === 'Any beds' ? 0 : parseInt(beds, 10);
    const filtered = PROPERTIES.filter((property) => {
      const matchesLocation =
        query === '' ||
        property.name.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query);
      const matchesPrice =
        priceRange === 'Any price' ||
        (priceRange === 'Under $500K' && property.price < 500000) ||
        (priceRange === '$500K - $1M' &&
          property.price >= 500000 &&
          property.price <= 1000000) ||
        (priceRange === 'Over $1M' && property.price > 1000000);
      const matchesBeds = property.beds >= minBeds;
      const matchesType = type === 'Any type' || property.type === type;
      return matchesLocation && matchesPrice && matchesBeds && matchesType;
    });
    setResults(filtered);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Search Filters</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find your next property.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body gap-3 p-5">
            <div className="relative">
              <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Search by location..."
                aria-label="Location"
                className="input input-bordered w-full pl-9"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={priceRange}
                onChange={(event) => setPriceRange(event.target.value)}
                aria-label="Price range"
                className="select select-bordered w-full">
                {PRICE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={beds}
                onChange={(event) => setBeds(event.target.value)}
                aria-label="Bedrooms"
                className="select select-bordered w-full">
                {BED_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                aria-label="Type"
                className="select select-bordered w-full">
                {TYPE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base-content/50 text-sm">
                {results.length} properties found
              </p>
              <button
                type="button"
                onClick={applyFilters}
                className="btn btn-primary btn-sm gap-1">
                <FiFilter />
                Apply filters
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {results.map((property) => (
              <div
                key={property.id}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <FiSliders className="text-base-content/30 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{property.name}</p>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiMapPin className="h-3 w-3" />
                    {property.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-medium">
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-base-content/50 text-xs">
                    {property.beds} beds · {property.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

SearchFiltersTemplate.displayName = 'SearchFiltersTemplate';
