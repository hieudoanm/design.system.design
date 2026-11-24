'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';

interface ContactFormProps {
  title?: string;
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
  className?: string;
}

export const ContactForm: FC<ContactFormProps> = ({
  title = 'Contact us',
  onSubmit,
  className = '',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
    onSubmit?.({ name, email, message });
  };

  return (
    <form
      data-testid="contact-form"
      onSubmit={handleSubmit}
      className={`card bg-base-200 border-base-content/10 flex w-full max-w-md flex-col gap-4 border p-6 ${className}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="form-control flex flex-col gap-1">
        <label htmlFor="contact-name" className="label-text">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          placeholder="Jane Doe"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="input input-bordered"
        />
      </div>
      <div className="form-control flex flex-col gap-1">
        <label htmlFor="contact-email" className="label-text">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          placeholder="jane@acme.io"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input input-bordered"
        />
      </div>
      <div className="form-control flex flex-col gap-1">
        <label htmlFor="contact-message" className="label-text">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          placeholder="How can we help?"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="textarea textarea-bordered"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        {submitted ? 'Message sent' : 'Send message'}
      </button>
    </form>
  );
};
