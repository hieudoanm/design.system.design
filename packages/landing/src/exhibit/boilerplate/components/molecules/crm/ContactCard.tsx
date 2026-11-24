import type { FC } from 'react';

interface ContactCardProps {
  name: string;
  email: string;
  title?: string;
  company?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

export const ContactCard: FC<ContactCardProps> = ({
  name,
  email,
  title,
  company,
  phone,
  avatar,
  status,
}) => (
  <article data-testid="contact-card" className="card bg-base-100 shadow-sm">
    <div className="card-body items-center text-center">
      <div className="avatar">
        <div className="bg-primary text-primary-content w-16 rounded-full">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold">
              {name.charAt(0)}
            </span>
          )}
        </div>
      </div>
      <h3 className="card-title">{name}</h3>
      {title && (
        <p className="text-base-content/70 text-sm">
          {title}
          {company && ` at ${company}`}
        </p>
      )}
      {status && <div className="badge badge-primary badge-sm">{status}</div>}
      <div className="text-base-content/60 mt-2 flex flex-col gap-1 text-sm">
        <a href={`mailto:${email}`}>{email}</a>
        {phone && <span>{phone}</span>}
      </div>
    </div>
  </article>
);

ContactCard.displayName = 'ContactCard';
