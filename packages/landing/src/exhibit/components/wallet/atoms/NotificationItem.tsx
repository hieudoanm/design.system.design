import { FC } from 'react';
import type { Notification } from '@/exhibit/types/wallet';
import { formatRelativeDate } from '@/exhibit/lib/wallet/format';
import {
  FiSend,
  FiAlertTriangle,
  FiGift,
  FiSettings,
  FiBell,
} from 'react-icons/fi';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'transaction':
      return <FiSend />;
    case 'alert':
      return <FiAlertTriangle />;
    case 'promotion':
      return <FiGift />;
    case 'system':
      return <FiSettings />;
    default:
      return <FiBell />;
  }
};

const typeBadge = (type: string) => {
  switch (type) {
    case 'alert':
      return 'badge badge-warning badge-outline';
    case 'transaction':
      return 'badge badge-info badge-outline';
    case 'promotion':
      return 'badge badge-success badge-outline';
    case 'system':
      return 'badge badge-ghost badge-outline';
    default:
      return 'badge badge-ghost';
  }
};

const NotificationItem: FC<NotificationItemProps> = ({
  notification,
  onRead,
}) => {
  return (
    <div
      className={`bg-base-200 flex items-start gap-3 rounded-xl p-4 ${
        !notification.read ? 'ring-primary ring-1' : ''
      }`}
      onClick={() => {
        if (!notification.read && onRead) onRead(notification.id);
      }}
      role="button"
      tabIndex={0}>
      <span className="text-2xl">{typeIcon(notification.type)}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{notification.title}</p>
          <span className={typeBadge(notification.type)}>
            {notification.type}
          </span>
          {!notification.read && (
            <span className="badge badge-primary badge-sm">New</span>
          )}
        </div>
        <p className="text-base-content/60 text-sm">{notification.message}</p>
        <p className="text-base-content/60 mt-1 text-xs">
          {formatRelativeDate(notification.date)}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
