import { type FC } from 'react';
import { FiCheck } from 'react-icons/fi';

export const SuccessMark: FC = () => (
  <div className="bg-success/20 flex h-12 w-12 items-center justify-center rounded-full">
    <FiCheck className="text-success h-6 w-6" />
  </div>
);
