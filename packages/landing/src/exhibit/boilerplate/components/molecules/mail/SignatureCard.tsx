import type { FC } from 'react';

interface SignatureCardProps {
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export const SignatureCard: FC<SignatureCardProps> = ({
  name,
  role,
  company,
  email,
  phone,
  website,
}) => (
  <div className="card border-base-content/10 bg-base-200/50 border">
    <div className="card-body gap-3 p-4">
      <div className="flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content h-10 w-10 rounded-full">
            <span className="text-sm font-medium">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          {(role || company) && (
            <p className="text-base-content/50 text-sm">
              {[role, company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
      {(email || phone || website) && (
        <>
          <div className="divider my-0" />
          <ul className="text-base-content/60 space-y-0.5 text-xs">
            {email && <li>{email}</li>}
            {phone && <li>{phone}</li>}
            {website && <li>{website}</li>}
          </ul>
        </>
      )}
    </div>
  </div>
);

SignatureCard.displayName = 'SignatureCard';
