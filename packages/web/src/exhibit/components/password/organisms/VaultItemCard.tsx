'use client';

import { type FC, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  FiCopy,
  FiCreditCard,
  FiFileText,
  FiGlobe,
  FiKey,
  FiStar,
  FiTrash2,
  FiUser,
} from 'react-icons/fi';
import { formatRelativeTime } from '@/exhibit/utils/password/format';
import type { VaultItem, VaultItemType } from '@/exhibit/types/password';

const typeIcons: Record<VaultItemType, typeof FiGlobe> = {
  login: FiGlobe,
  card: FiCreditCard,
  identity: FiUser,
  note: FiFileText,
  ssh: FiKey,
};
const typeColors: Record<VaultItemType, string> = {
  login: 'text-primary',
  card: 'text-secondary',
  identity: 'text-accent',
  note: 'text-info',
  ssh: 'text-warning',
};

const SWIPE_LIMIT = 96;
const SWIPE_THRESHOLD = 48;

interface VaultItemCardProps {
  item: VaultItem;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  onDeleteRequest: (item: VaultItem) => void;
  onDragStart: (id: string) => void;
  onDragEnd?: () => void;
}

export const VaultItemCard: FC<VaultItemCardProps> = ({
  item,
  selectMode,
  selected,
  onToggleSelect,
  onCopy,
  onDeleteRequest,
  onDragStart,
  onDragEnd,
}) => {
  const Icon = typeIcons[item.type];
  const [swipeX, setSwipeX] = useState(0);
  const startX = useRef<number | null>(null);
  const swiping = useRef(false);
  const revealed = swipeX < -SWIPE_THRESHOLD;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectMode) return;
    startX.current = e.touches?.[0]?.clientX ?? 0;
    swiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping.current || startX.current === null) return;
    const x = e.touches?.[0]?.clientX ?? 0;
    const dx = Math.max(-SWIPE_LIMIT, Math.min(0, x - startX.current));
    setSwipeX(dx);
  };

  const endSwipe = () => {
    swiping.current = false;
    startX.current = null;
    setSwipeX((x) => (x < -SWIPE_THRESHOLD ? -SWIPE_LIMIT : 0));
  };

  const cancelSwipe = () => {
    swiping.current = false;
    startX.current = null;
    setSwipeX(0);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectMode) {
      e.preventDefault();
      onToggleSelect(item.id);
    } else if (swipeX !== 0) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <button
        type="button"
        aria-label={`Delete ${item.title}`}
        onClick={() => onDeleteRequest(item)}
        className="bg-error absolute inset-y-0 right-0 flex w-24 items-center justify-center rounded-lg"
        style={{
          opacity: revealed ? 1 : 0,
          pointerEvents: revealed ? 'auto' : 'none',
        }}>
        <FiTrash2 className="size-5 text-white" />
      </button>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        style={{ transform: `translateX(${swipeX}px)` }}>
        <Link
          href={`/design-system/exhibits/password`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', item.id);
            onDragStart(item.id);
          }}
          onDragEnd={onDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={endSwipe}
          onTouchCancel={cancelSwipe}
          onClick={handleCardClick}
          className="card bg-base-200 card-body hover:bg-base-300 flex-row items-center gap-3 p-3 transition-colors">
          {selectMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${item.title}`}
              className="checkbox checkbox-primary checkbox-sm"
            />
          )}
          <Icon className={`size-6 ${typeColors[item.type]}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              {item.favorite && (
                <FiStar className="text-warning fill-warning size-3" />
              )}
            </div>
            <p className="text-base-content/50 text-xs">
              {item.username || item.type}
            </p>
            <div className="mt-1 flex gap-2 text-xs opacity-50">
              {item.tags.map((t) => (
                <span key={t} className="badge badge-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
          {!selectMode && (
            <div className="flex gap-1">
              {item.password && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onCopy(item.password!, 'Password');
                  }}
                  className="btn btn-ghost btn-xs btn-circle">
                  <FiCopy className="size-3" />
                </button>
              )}
              {item.username && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onCopy(item.username!, 'Username');
                  }}
                  className="btn btn-ghost btn-xs btn-circle">
                  <FiUser className="size-3" />
                </button>
              )}
            </div>
          )}
          <span className="text-base-content/30 text-xs">
            {formatRelativeTime(item.updatedAt)}
          </span>
        </Link>
      </motion.div>
    </div>
  );
};
