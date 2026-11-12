'use client';

import { type FC, useEffect, useState } from 'react';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import { Avatar } from '@/exhibit/components/chat/atoms/Avatar';
import type { Call } from '@/exhibit/types/chat';

interface IncomingCallModalProps {
  call: Call;
  onAnswer: (callId: string) => void;
  onDecline: (callId: string) => void;
}

export const IncomingCallModal: FC<IncomingCallModalProps> = ({
  call,
  onAnswer,
  onDecline,
}) => {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDecline(call.id);
    }, 30000);
    return () => clearTimeout(timer);
  }, [call.id, onDecline]);

  const caller = call.participants.find((p) => p.userId !== 'me');
  if (!caller) return null;

  return (
    <div className="bg-base-100/95 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md">
      <div className={`mb-6 rounded-full ${ringing ? 'animate-pulse' : ''}`}>
        <Avatar name={caller.name} color={caller.avatarColor} size="lg" />
      </div>
      <h2 className="text-2xl font-bold">{caller.name}</h2>
      <p className="text-base-content/60 mt-1 text-sm">
        Incoming {call.type} call…
      </p>
      <div className="mt-12 flex gap-8">
        <button
          type="button"
          onClick={() => onDecline(call.id)}
          className="btn btn-circle btn-lg btn-error"
          aria-label="Decline">
          <FaPhoneSlash className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => {
            setRinging(false);
            onAnswer(call.id);
          }}
          className="btn btn-circle btn-lg btn-success"
          aria-label="Answer">
          <FaPhone className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
