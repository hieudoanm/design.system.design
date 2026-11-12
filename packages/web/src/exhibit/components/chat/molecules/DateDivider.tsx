import { type FC } from 'react';
import { formatDayDivider } from '@/exhibit/lib/chat/format';

interface DateDividerProps {
  timestamp: number;
}

export const DateDivider: FC<DateDividerProps> = ({ timestamp }) => (
  <div className="my-3 flex items-center justify-center">
    <span className="bg-base-200 text-base-content/60 rounded-full px-3 py-1 text-xs font-medium">
      {formatDayDivider(timestamp)}
    </span>
  </div>
);
