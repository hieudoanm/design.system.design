'use client';

import { type FC } from 'react';
import { FaTimes, FaUserShield, FaUserMinus } from 'react-icons/fa';
import { useData } from '@/exhibit/providers/chat/DataProvider';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import type { Chat } from '@/exhibit/types/chat';

interface GroupAdminPanelProps {
  chat: Chat;
  onClose: () => void;
}

export const GroupAdminPanel: FC<GroupAdminPanelProps> = ({
  chat,
  onClose,
}) => {
  const { contacts, promoteAdmin, demoteAdmin, removeGroupMember } = useData();

  const members = chat.memberIds
    .map((id) => contacts.find((c) => c.id === id))
    .filter(Boolean) as NonNullable<ReturnType<typeof contacts.find>>[];

  const isMeAdmin = chat.adminIds.includes('me');

  return (
    <div className="border-base-300 bg-base-100 flex h-full w-full flex-col border-r md:w-80">
      <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
        <h2 className="flex-1 font-semibold">Group Members</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn btn-xs btn-ghost">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {members.map((member) => {
          const isAdmin = chat.adminIds.includes(member.id);
          const isOwner = member.id === chat.adminIds[0];
          return (
            <div
              key={member.id}
              className="hover:bg-base-200 flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar
                name={member.name}
                color={member.avatarColor}
                online={member.online}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">
                    {member.name}
                  </span>
                  {isOwner && (
                    <span className="badge badge-primary badge-xs">Owner</span>
                  )}
                  {isAdmin && !isOwner && (
                    <span className="badge badge-secondary badge-xs">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-base-content/50 block text-xs">
                  @{member.username}
                </span>
              </div>
              {isMeAdmin && !isOwner && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      isAdmin
                        ? demoteAdmin(chat.id, member.id)
                        : promoteAdmin(chat.id, member.id)
                    }
                    aria-label={isAdmin ? 'Demote admin' : 'Promote to admin'}
                    className={`btn btn-xs btn-ghost ${isAdmin ? 'text-warning' : 'text-base-content/50'}`}>
                    <FaUserShield aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGroupMember(chat.id, member.id)}
                    aria-label="Remove member"
                    className="btn btn-xs btn-ghost text-error">
                    <FaUserMinus aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
