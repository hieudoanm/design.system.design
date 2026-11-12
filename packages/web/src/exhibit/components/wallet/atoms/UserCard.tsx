import { FC } from 'react';
import type { User } from '@/exhibit/types/wallet';
import { FiUser } from 'react-icons/fi';

interface UserCardProps {
  user: User;
}

const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body items-center gap-4">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content flex h-20 w-20 items-center justify-center rounded-full">
            <FiUser className="text-2xl" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-base-content/60">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
