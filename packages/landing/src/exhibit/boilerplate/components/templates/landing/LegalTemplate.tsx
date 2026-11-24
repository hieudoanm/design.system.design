import type { FC, ReactNode } from 'react';
import Link from '@/exhibit/boilerplate/link';

export interface LegalSection {
  heading: string;
  body: string;
}

interface LegalTemplateProps {
  title: string;
  sections: LegalSection[];
  contact: ReactNode;
}

export const LegalTemplate: FC<LegalTemplateProps> = ({
  title,
  sections,
  contact,
}) => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Boilerplate
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

    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
      <span className="badge badge-neutral mb-6 rounded-full">Legal</span>
      <h1 className="mb-8 text-4xl md:text-5xl">{title}</h1>

      <div className="text-base-content/70 flex flex-col gap-6 text-sm leading-relaxed">
        <p>Last updated: January 2024</p>

        {sections.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="text-base-content mb-3 text-lg">{heading}</h2>
            <p>{body}</p>
          </section>
        ))}

        <section>
          <h2 className="text-base-content mb-3 text-lg">7. Contact</h2>
          <p>{contact}</p>
        </section>
      </div>
    </main>

    <footer className="border-base-300 border-t px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-base-content/50 text-xs">
          &copy; {new Date().getFullYear()} Boilerplate. All rights reserved.
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

LegalTemplate.displayName = 'LegalTemplate';
