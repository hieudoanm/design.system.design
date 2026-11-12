'use client';

import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { FiCopy, FiExternalLink, FiLink } from 'react-icons/fi';
import type { Restaurant } from '@/exhibit/types/menu';
import { itemsForRestaurant, makeCustomerUrl } from '@/exhibit/lib/menu';
import type { MenuStore } from '@/exhibit/components/menu/types';
import { qrDataUrl } from '@/exhibit/lib/menu/qr';

interface QrShareProps {
  restaurant: Restaurant;
  store: MenuStore;
}

const QrShare: FC<QrShareProps> = ({ restaurant, store }) => {
  const [url, setUrl] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const items = itemsForRestaurant(store.state, restaurant.id);

  useEffect(() => {
    const relative = makeCustomerUrl(restaurant, items);
    const next = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}${relative}`;
    setUrl(next);
    qrDataUrl(next, 320)
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [restaurant, items]);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="QR code linking to this restaurant menu"
          className="h-64 w-64 rounded-xl bg-white p-2"
        />
      ) : (
        <div className="bg-base-200 text-base-content/40 flex h-64 w-64 items-center justify-center rounded-xl">
          Generating…
        </div>
      )}
      <div className="flex w-full max-w-96 flex-col gap-3">
        <h3 className="text-xl font-bold">Share the menu</h3>
        <p className="text-base-content/70">
          Print this QR code or send the link. Guests scan it with their phone
          camera to open your menu and place an order.
        </p>
        <div className="flex items-center gap-2">
          <FiLink className="text-primary shrink-0" />
          <span className="text-base-content/80 truncate text-sm break-all">
            {url || makeCustomerUrl(restaurant, items)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary btn-sm" onClick={handleCopy}>
            <FiCopy className="mr-1" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {url && (
            <a
              className="btn btn-outline btn-sm"
              href={url}
              target="_blank"
              rel="noopener noreferrer">
              <FiExternalLink className="mr-1" />
              Open menu
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export { QrShare, type QrShareProps };
