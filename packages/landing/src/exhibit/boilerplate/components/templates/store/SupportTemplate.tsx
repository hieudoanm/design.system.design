'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiCheck,
  FiChevronRight,
  FiMessageCircle,
  FiSend,
  FiShoppingCart,
} from 'react-icons/fi';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days within the country.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'You can return items within 30 days of delivery for a full refund.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'You can track your order anytime with your order ID on the tracking page.',
  },
  {
    question: 'Do you offer gift wrapping?',
    answer: 'Yes, gift wrapping is free at checkout on qualifying orders.',
  },
];

export const SupportTemplate: FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }
    setError(null);
    setSent(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store/cart" className="btn btn-ghost btn-sm">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/store"
            className="text-base-content/50 hover:text-primary transition-colors">
            Store
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <span>Support</span>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2>Support</h2>
            <p className="text-base-content/50 mt-1 text-sm">
              Answers and help for common questions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            className="btn btn-primary btn-sm gap-1">
            <FiMessageCircle className="h-4 w-4" />
            Chat with us
          </button>
        </div>

        {chatOpen && (
          <div className="border-base-content/10 bg-base-200 mb-8 rounded-xl border p-4">
            <div className="bg-base-300 rounded-lg px-4 py-3 text-sm">
              Hi! How can we help you today?
            </div>
            <p className="text-base-content/50 mt-3 text-xs">
              Support agents reply in a few minutes during store hours.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4">Frequently asked questions</h3>
            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="border-base-content/10 bg-base-200 rounded-xl border p-4">
                  <summary className="text-sm font-medium">
                    {faq.question}
                  </summary>
                  <p className="text-base-content/50 mt-3 text-sm">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div>
            <div className="border-base-content/10 bg-base-200 rounded-xl border p-5">
              <h3 className="mb-4">Send us a message</h3>

              {sent && (
                <div className="alert alert-success mb-4 text-sm">
                  <FiCheck size={16} />
                  Message sent, we reply within 24h
                </div>
              )}

              {error && (
                <div className="alert alert-error mb-4 text-sm">{error}</div>
              )}

              <form onSubmit={handleSend} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="support-subject"
                    className="text-sm font-medium">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    placeholder="Subject"
                    className="input input-bordered w-full"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="support-message"
                    className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    placeholder="Describe your issue"
                    className="textarea textarea-bordered min-h-28 w-full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary gap-1">
                  <FiSend className="h-4 w-4" />
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-primary text-lg font-bold tracking-tight">
            Boilerplate
          </p>
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate Store &middot; Built
            with care
          </p>
        </div>
      </footer>
    </div>
  );
};

SupportTemplate.displayName = 'SupportTemplate';
