import type { FC } from 'react';

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
}

interface HotelSearchProps {
  hotels: Hotel[];
  onSelect?: (id: string) => void;
}

export const HotelSearch: FC<HotelSearchProps> = ({ hotels, onSelect }) => {
  return (
    <section data-testid="hotel-search" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body gap-3 p-4">
          <h2 className="text-lg font-medium">Find your stay</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input input-bordered flex-1"
              placeholder="Destination, hotel, or area"
              aria-label="Hotel destination"
            />
            <button type="button" className="btn btn-primary">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <article key={hotel.id} className="card bg-base-200">
            <figure className="bg-secondary/20 flex aspect-[4/3] items-center justify-center">
              <span
                className="text-base-content/30 text-4xl"
                aria-hidden="true">
                &#8962;
              </span>
              <span className="badge badge-secondary absolute top-2 left-2">
                {hotel.rating} &#9733;
              </span>
            </figure>
            <div className="card-body gap-2 p-4">
              <h3 className="text-base font-medium">{hotel.name}</h3>
              <p className="text-base-content/50 text-sm">{hotel.location}</p>
              <div className="flex flex-wrap gap-1">
                {hotel.amenities.map((amenity) => (
                  <span key={amenity} className="badge badge-ghost badge-sm">
                    {amenity}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-lg font-semibold">
                  ${hotel.price.toLocaleString()}
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onSelect?.(hotel.id)}>
                  Book
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
