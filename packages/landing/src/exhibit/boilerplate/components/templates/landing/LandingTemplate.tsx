'use client';

import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiArrowRight,
  FiCheck,
  FiStar,
  FiZap,
  FiShield,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiSend,
  FiMail,
  FiMapPin,
  FiClock,
} from 'react-icons/fi';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface LandingTemplateProps {
  name: string;
  tagline: string;
  description: string;
  features: Feature[];
  ctaLabel?: string;
  ctaHref?: string;
  tiers?: PricingTier[];
  faqs?: FAQItem[];
}

const defaultTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      { text: 'Up to 3 projects', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Community support', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'Advanced reports', included: false },
    ],
    cta: 'Get started',
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'Best for growing teams',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Advanced reports', included: false },
    ],
    cta: 'Start trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For large organizations',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Advanced reports', included: true },
    ],
    cta: 'Contact sales',
  },
];

const defaultFaqs: FAQItem[] = [
  {
    question: 'What is Boilerplate?',
    answer:
      'A comprehensive starter kit for building modern web applications with pre-built components, templates, and best practices.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Sign up for a free account and follow our quickstart guide. You can have your first project running in under 5 minutes.',
  },
  {
    question: 'Can I upgrade my plan later?',
    answer:
      'Yes, you can upgrade or downgrade at any time. Changes take effect immediately and are prorated.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'All paid plans come with a 14-day free trial. No credit card required.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'We use end-to-end encryption, SOC 2 compliant infrastructure, and regular security audits.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer:
      'Yes, you can cancel anytime. Your access continues until the end of the billing period.',
  },
];

const FeatureCard: FC<Feature> = ({ icon, title, description }) => (
  <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
      {icon}
    </div>
    <h3 className="mb-2 text-lg">{title}</h3>
    <p className="text-base-content/50 text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const PricingSection: FC<{ tiers: PricingTier[] }> = ({ tiers }) => (
  <section className="mx-auto max-w-6xl px-6 py-24">
    <div className="mb-16 flex flex-col items-center text-center">
      <span className="badge badge-neutral mb-6 rounded-full">Pricing</span>
      <h2 className="mb-4 text-3xl md:text-4xl">Simple, transparent pricing</h2>
      <p className="text-base-content/50 max-w-xl text-sm">
        No hidden fees. Pick the plan that works for you.
      </p>
    </div>
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`border-base-content/10 bg-base-200 relative flex flex-col rounded-2xl border p-6 ${tier.popular ? 'ring-primary ring-2' : ''}`}>
          {tier.popular && (
            <span className="badge badge-primary absolute -top-3 left-1/2 -translate-x-1/2 rounded-full">
              Most popular
            </span>
          )}
          <div className="mb-6">
            <h3 className="text-xl">{tier.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-base-content/50 text-sm">/month</span>
            </div>
            <p className="text-base-content/50 mt-1 text-sm">
              {tier.description}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {tier.features.map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm">
                {f.included ? (
                  <FiCheck className="text-success h-4 w-4 shrink-0" />
                ) : (
                  <FiX className="text-base-content/30 h-4 w-4 shrink-0" />
                )}
                <span className={f.included ? '' : 'text-base-content/40'}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/auth/sign-up"
            className={`btn mt-8 w-full ${tier.popular ? 'btn-primary' : 'btn-ghost border-base-content/10 border'}`}>
            {tier.cta} <FiArrowRight />
          </Link>
        </div>
      ))}
    </div>
  </section>
);

const FAQSection: FC<{ faqs: FAQItem[] }> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const filtered = query
    ? faqs.filter((f) => f.question.toLowerCase().includes(query.toLowerCase()))
    : faqs;

  return (
    <section className="bg-base-200 border-base-content/10 border-y px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="badge badge-neutral mb-6 rounded-full">FAQ</span>
          <h2 className="mb-4 text-3xl md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-base-content/50 mb-8 max-w-xl text-sm">
            Everything you need to know.
          </p>
          <div className="relative w-full max-w-md">
            <FiSearch className="text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions..."
              className="input input-bordered w-full pl-10"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenIndex(null);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {filtered.map((faq, i) => (
            <div
              key={i}
              className="border-base-content/10 bg-base-100 rounded-xl border">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left">
                <span className="pr-4 text-sm font-medium">{faq.question}</span>
                {openIndex === i ? (
                  <FiChevronUp className="text-base-content/40 h-4 w-4 shrink-0" />
                ) : (
                  <FiChevronDown className="text-base-content/40 h-4 w-4 shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="border-base-content/10 border-t px-6 py-4">
                  <p className="text-base-content/60 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-base-content/40 py-12 text-center text-sm">
              No questions match your search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

const ContactSection: FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <span className="badge badge-neutral mb-6 rounded-full">Contact</span>
        <h2 className="mb-4 text-3xl md:text-4xl">Get in touch</h2>
        <p className="text-base-content/50 max-w-xl text-sm">
          Have a question? We&apos;d love to hear from you.
        </p>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          {[
            {
              icon: <FiMail />,
              label: 'Email',
              value: 'hello@boilerplate.com',
            },
            {
              icon: <FiMapPin />,
              label: 'Location',
              value: 'San Francisco, CA',
            },
            {
              icon: <FiClock />,
              label: 'Response time',
              value: 'Within 24 hours',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-base-content/10 bg-base-200 flex items-center gap-4 rounded-xl border p-4">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                {item.icon}
              </div>
              <div>
                <p className="text-base-content/50 text-xs">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6 lg:col-span-2">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="bg-success/10 text-success flex h-16 w-16 items-center justify-center rounded-full">
                <FiCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl">Message sent!</h3>
              <p className="text-base-content/50 max-w-sm text-sm">
                We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn btn-ghost btn-sm mt-2">
                Send another
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="contact-name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="contact-email"
                    className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    className="input input-bordered"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contact-subject"
                  className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="How can we help?"
                  className="input input-bordered"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  placeholder="Tell us more..."
                  className="textarea textarea-bordered"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary gap-2 self-start">
                <FiSend className="h-4 w-4" />
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export const LandingTemplate: FC<LandingTemplateProps> = ({
  name,
  tagline,
  description,
  features,
  ctaLabel = 'Get started',
  ctaHref = '/sign-up',
  tiers = defaultTiers,
  faqs = defaultFaqs,
}) => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
      <Link href="/" className="text-lg font-bold tracking-tight">
        {name}
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/auth/sign-in" className="btn btn-ghost btn-sm">
          Sign in
        </Link>
        <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
          Sign up
        </Link>
      </nav>
    </header>

    <main className="flex-1">
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <span className="badge badge-neutral mb-6 rounded-full">{tagline}</span>
        <h1 className="mb-6 max-w-3xl text-5xl md:text-6xl">{description}</h1>
        <p className="text-base-content/50 mb-10 max-w-xl text-sm">{tagline}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={ctaHref} className="btn btn-primary">
            {ctaLabel} <FiArrowRight />
          </Link>
          <Link href="/shared/about" className="btn btn-ghost">
            Learn more
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2>Everything you need</h2>
          <p className="text-base-content/50 mt-2 max-w-md text-sm">
            Built for modern teams. Simple, fast, and reliable.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <PricingSection tiers={tiers} />

      <FAQSection faqs={faqs} />

      <ContactSection />

      <section className="border-base-content/10 bg-base-200 border-y py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          <h2 className="mb-4">Ready to get started?</h2>
          <p className="text-base-content/50 mb-8 max-w-md text-sm">
            Join thousands of users who trust {name} for their daily workflow.
          </p>
          <Link href={ctaHref} className="btn btn-primary">
            {ctaLabel} <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>

    <footer className="border-base-300 border-t px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-base-content/50 text-xs">
          &copy; {new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/landing/privacy"
            className="text-base-content/50 hover:text-base-content text-xs transition-colors">
            Privacy
          </Link>
          <Link
            href="/landing/terms"
            className="text-base-content/50 hover:text-base-content text-xs transition-colors">
            Terms
          </Link>
          <Link
            href="/landing/contact"
            className="text-base-content/50 hover:text-base-content text-xs transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  </div>
);

LandingTemplate.displayName = 'LandingTemplate';
