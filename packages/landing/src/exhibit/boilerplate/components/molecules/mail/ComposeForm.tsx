'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface ComposeFormValues {
  to: string;
  subject: string;
  body: string;
}

interface ComposeFormProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  onSubmit?: (values: ComposeFormValues) => void;
}

export const ComposeForm: FC<ComposeFormProps> = ({
  defaultTo = '',
  defaultSubject = '',
  defaultBody = '',
  onSubmit,
}) => {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  return (
    <form
      data-testid="compose-form"
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ to, subject, body });
      }}>
      <div className="form-control">
        <label className="label" htmlFor="compose-to">
          <span className="label-text">To</span>
        </label>
        <input
          id="compose-to"
          type="email"
          placeholder="recipient@example.com"
          className="input input-bordered"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="label" htmlFor="compose-subject">
          <span className="label-text">Subject</span>
        </label>
        <input
          id="compose-subject"
          type="text"
          placeholder="Subject"
          className="input input-bordered"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="label" htmlFor="compose-body">
          <span className="label-text">Message</span>
        </label>
        <textarea
          id="compose-body"
          rows={8}
          placeholder="Write your message..."
          className="textarea textarea-bordered"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          data-testid="compose-send"
          className="btn btn-primary">
          Send
        </button>
      </div>
    </form>
  );
};

ComposeForm.displayName = 'ComposeForm';
