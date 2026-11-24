'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '../../atoms/support/Button';
import { FormRow } from '../../molecules/app/FormRow';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

interface ContactSectionProps {
  title?: string;
  description?: string;
  onSubmit?: (payload: ContactPayload) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactSection: FC<ContactSectionProps> = ({
  title = 'Contact us',
  description,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (
      name.trim() === '' ||
      !EMAIL_PATTERN.test(email) ||
      message.trim() === ''
    ) {
      setError('Please fill in all fields with a valid email.');
      return;
    }
    setError(undefined);
    setSent(true);
    onSubmit?.({ name: name.trim(), email, message: message.trim() });
  };

  return (
    <section className="bg-base-200 border-base-content/10 rounded-2xl border px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h2 className="text-2xl">{title}</h2>
        {description && (
          <p className="text-base-content/60 text-sm">{description}</p>
        )}
        {sent ? (
          <div role="status" className="badge badge-success badge-lg">
            Message sent — we will reply soon
          </div>
        ) : (
          <form
            noValidate
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}>
            <FormRow label="Name" htmlFor="contact-name" required>
              <input
                id="contact-name"
                aria-label="Name"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormRow>
            <FormRow label="Email" htmlFor="contact-email" required>
              <input
                id="contact-email"
                aria-label="Email"
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormRow>
            <FormRow label="Message" htmlFor="contact-message" required>
              <textarea
                id="contact-message"
                aria-label="Message"
                rows={4}
                className="textarea textarea-bordered w-full"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </FormRow>
            {error && <span className="text-error text-xs">{error}</span>}
            <Button type="submit">Send message</Button>
          </form>
        )}
      </div>
    </section>
  );
};
