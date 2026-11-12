'use client';

import { FC } from 'react';
import Link from 'next/link';
import {
  FiSend,
  FiSmartphone,
  FiCreditCard,
  FiBarChart2,
} from 'react-icons/fi';

const QuickActions: FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Link href="/design-system/exhibits/wallet" className="btn btn-primary gap-2">
        <FiSend /> Transfer
      </Link>
      <Link href="/design-system/exhibits/wallet" className="btn btn-secondary gap-2">
        <FiSmartphone /> Pay
      </Link>
      <Link href="/design-system/exhibits/wallet" className="btn btn-accent gap-2">
        <FiCreditCard /> Cards
      </Link>
      <Link href="/design-system/exhibits/wallet" className="btn btn-info gap-2">
        <FiBarChart2 /> Budget
      </Link>
    </div>
  );
};

export default QuickActions;
