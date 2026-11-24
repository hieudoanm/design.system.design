'use client';

import type { FC } from 'react';
import { useContext, useState } from 'react';
import { FiShield, FiStar, FiZap } from 'react-icons/fi';
import { PasswordResetTemplate } from '@/exhibit/boilerplate/components/templates/auth/PasswordResetTemplate';
import { SettingsTemplate } from '@/exhibit/boilerplate/components/templates/landing/SettingsTemplate';
import { SignInTemplate } from '@/exhibit/boilerplate/components/templates/auth/SignInTemplate';
import { SignUpTemplate } from '@/exhibit/boilerplate/components/templates/auth/SignUpTemplate';
import BoilerplateLink from './link';
import { BoilerplateNavContext } from './nav';

/*
 * Demo props for the boilerplate screens that require them, keyed
 * '<namespace>/<route-slug>' — copied from the props the original app
 * router pages passed to the same templates. screenOverrides holds
 * stateful wrappers for the screens whose pages owned form state.
 */

const blogPosts = [
  {
    slug: 'getting-started',
    title: 'Getting Started with Modern Web Development',
    description:
      'A comprehensive guide to building modern web applications with the latest tools and frameworks.',
    content:
      '## Introduction\n\nModern web development has evolved significantly over the past decade.\n\n## Getting Started\n\nThis is a sample blog post used for previewing the BlogTemplate component.',
    date: '2024-01-15',
    author: 'Jane Doe',
    tags: ['Web Development', 'JavaScript', 'React'],
    coverImage:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
    readingTime: 8,
  },
  {
    slug: 'advanced-patterns',
    title: 'Advanced Patterns in React',
    description:
      'Explore advanced React patterns including render props, compound components, and hooks.',
    content: 'Sample content for advanced React patterns.',
    date: '2024-01-10',
    author: 'Jane Doe',
    tags: ['React', 'JavaScript'],
    readingTime: 12,
  },
  {
    slug: 'styling-guide',
    title: 'Tailwind CSS Best Practices',
    description: 'Learn how to effectively use Tailwind CSS in large-scale applications.',
    content: 'Sample content for Tailwind CSS best practices.',
    date: '2024-01-05',
    author: 'John Smith',
    tags: ['Tailwind CSS', 'Web Development'],
    readingTime: 6,
  },
];

const recentPosts = blogPosts.map(({ slug, title, date }) => ({ slug, title, date }));

const pad = (n: number) => n.toString().padStart(2, '0');
const buildVersion = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('.');
};

export const templateProps: Record<string, Record<string, Record<string, unknown>>> = {
  auth: {
    error: {
      code: '500',
      description: 'Something went wrong.',
      action: (
        <BoilerplateLink href='/app/dashboard' className='btn btn-primary btn-sm'>
          Go home
        </BoilerplateLink>
      ),
    },
    'not-found': { variant: 'not-found' },
  },
  blog: {
    index: { posts: blogPosts },
    '[slug]': { post: blogPosts[0], recentPosts },
  },
  landing: {
    landing: {
      name: 'Boilerplate',
      tagline: 'Modern Next.js Starter',
      description: 'Build faster with TypeScript, Tailwind CSS, and DaisyUI',
      features: [
        {
          icon: <FiStar className='text-primary h-6 w-6' />,
          title: 'Beautiful UI',
          description:
            'Pre-built components with DaisyUI. Dark mode by default, light mode included.',
        },
        {
          icon: <FiZap className='text-primary h-6 w-6' />,
          title: 'Blazing fast',
          description:
            'Built on Next.js App Router. Automatic code splitting, streaming, and edge-ready.',
        },
        {
          icon: <FiShield className='text-primary h-6 w-6' />,
          title: 'Type safe',
          description:
            'Full TypeScript support with strict mode. Catch errors before they reach production.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: '1. Information We Collect',
          body: 'We collect information you provide directly to us, such as your name, email address, and payment information when you create an account or use the Service.',
        },
        {
          heading: '2. How We Use Your Information',
          body: 'We use the information we collect to provide, maintain, and improve the Service, process transactions, send technical notices, and respond to your requests.',
        },
        {
          heading: '3. Data Sharing',
          body: 'We do not sell your personal information. We may share data with third-party service providers who help us operate the Service, subject to strict confidentiality agreements.',
        },
        {
          heading: '4. Data Security',
          body: 'We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls to protect your data.',
        },
        {
          heading: '5. Your Rights',
          body: 'You have the right to access, update, or delete your personal data at any time through your account settings or by contacting us.',
        },
        {
          heading: '6. Cookies',
          body: 'We use cookies and similar tracking technologies to improve your experience. You can control cookie preferences in your browser settings.',
        },
      ],
      contact: (
        <>
          For privacy-related inquiries, contact us at{' '}
          <span className='text-primary'>privacy@boilerplate.com</span>.
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          body: 'By accessing or using Boilerplate ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
        },
        {
          heading: '2. Description of Service',
          body: 'Boilerplate provides a web-based platform for building and deploying modern web applications. We reserve the right to modify, suspend, or discontinue the Service at any time.',
        },
        {
          heading: '3. User Obligations',
          body: 'You agree to use the Service in compliance with all applicable laws. You are responsible for maintaining the confidentiality of your account credentials.',
        },
        {
          heading: '4. Intellectual Property',
          body: 'The Service and its original content, features, and functionality are owned by Boilerplate and are protected by international copyright laws.',
        },
        {
          heading: '5. Limitation of Liability',
          body: 'Boilerplate shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.',
        },
      ],
      contact: (
        <>
          For questions about these terms, contact us at{' '}
          <span className='text-primary'>legal@boilerplate.com</span>.
        </>
      ),
    },
    resume: {
      profile: {
        name: 'Jane Doe',
        title: 'Software Engineer',
        tagline:
          'Full-stack engineer with 6+ years of experience building fast, accessible, and scalable web applications.',
        email: 'jane.doe@example.com',
        location: 'San Francisco, CA',
        website: 'https://janedoe.dev',
        summary:
          'I help startups and product teams ship reliable software. I specialise in TypeScript, React, and cloud infrastructure, and I care deeply about developer experience, clean architecture, and measurable outcomes.',
      },
      experiences: [
        {
          role: 'Senior Frontend Engineer',
          company: 'Acme Corp',
          period: '2023 - Present',
          description:
            'Leading the design system and platform team for a B2B analytics product used by 40k+ companies.',
          highlights: [
            'Cut page load time by 58% through code splitting and edge rendering',
            'Built a component library adopted by 12 product teams',
            'Mentored 5 engineers through the senior track',
          ],
        },
        {
          role: 'Full-stack Engineer',
          company: 'Globex',
          period: '2020 - 2023',
          description: 'Shipped customer-facing features across the checkout and payments stack.',
          highlights: [
            'Reduced checkout abandonment by 21% with a redesigned flow',
            'Scaled the payments API to handle 2M+ requests per day',
            'Drove the migration from a monolith to microservices',
          ],
        },
        {
          role: 'Software Engineer',
          company: 'Initech',
          period: '2018 - 2020',
          description:
            'Built internal tools and dashboards that automated reporting for 200+ users.',
          highlights: [
            'Automated quarterly reporting, saving 300+ hours a year',
            'Introduced automated testing to a legacy codebase',
          ],
        },
      ],
      projects: [
        {
          name: 'Openmetrics',
          description: 'Open-source dashboard for visualising web performance budgets in CI.',
          tech: ['TypeScript', 'Next.js', 'Turbopack'],
          url: 'https://github.com/janedoe/openmetrics',
        },
        {
          name: 'Promptkit',
          description: 'A library of reusable, typed React components for building chat UIs.',
          tech: ['React', 'Tailwind CSS', 'Vite'],
          url: 'https://github.com/janedoe/promptkit',
        },
        {
          name: 'Deployd',
          description: 'GitHub Action that previews pull requests on ephemeral edge environments.',
          tech: ['TypeScript', 'Cloudflare Workers'],
        },
        {
          name: 'Tauri Notes',
          description: 'A privacy-first notes app that runs offline on macOS, Linux, and Windows.',
          tech: ['Tauri', 'React', 'Rust'],
          url: 'https://github.com/janedoe/tauri-notes',
        },
      ],
      education: [
        {
          degree: 'B.Sc. in Computer Science',
          school: 'University of California, Berkeley',
          period: '2014 - 2018',
          details:
            'Graduated with honours. Focus on distributed systems and human-computer interaction.',
        },
      ],
      skills: [
        { label: 'Languages', skills: ['TypeScript', 'JavaScript', 'Rust', 'SQL'] },
        {
          label: 'Frontend',
          skills: ['React', 'Next.js', 'Tailwind CSS', 'React Native'],
        },
        { label: 'Backend', skills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL'] },
        {
          label: 'Tooling',
          skills: ['Docker', 'Turbopack', 'Playwright', 'GitHub Actions'],
        },
      ],
    },
    version: { version: buildVersion() },
  },
  mail: {
    'coming-soon': { variant: 'coming-soon' },
    maintenance: { variant: 'maintenance' },
  },
  support: {
    about: {
      name: 'Boilerplate',
      description: 'Next.js boilerplate with App Router, TypeScript, Tailwind CSS, and DaisyUI',
      version: 'v0.0.1',
      items: [
        { label: 'Language', value: 'TypeScript 6' },
        { label: 'Framework', value: 'Next.js 16' },
        { label: 'Router', value: 'App Router' },
        { label: 'Styling', value: 'Tailwind CSS 4' },
        { label: 'Components', value: 'DaisyUI 5' },
        { label: 'Icons', value: 'React Icons' },
        { label: 'Desktop', value: 'Tauri 2' },
      ],
    },
    'loading-app': { variant: 'app' },
    'loading-auth': { variant: 'auth' },
    'loading-blog': { variant: 'blog' },
    'loading-store': { variant: 'store' },
  },
};

/* Stateful wrappers — the original pages owned this state; the gallery
 * reproduces it so the screens behave like they did in the app. */

const useDelayedFlag = () => {
  const [flag, setFlag] = useState({ loading: false, error: '', success: false });
  const run = async (fail?: string) => {
    setFlag({ loading: true, error: '', success: false });
    await new Promise((r) => setTimeout(r, 600));
    setFlag({ loading: false, error: fail ?? '', success: !fail });
  };
  return { flag, run };
};

const SignInScreen: FC = () => {
  const nav = useContext(BoilerplateNavContext);
  const { flag, run } = useDelayedFlag();
  return (
    <SignInTemplate
      onSubmit={async ({ email, password }) => {
        await run(
          email === 'demo@example.com' && password === 'password'
            ? undefined
            : 'Invalid email or password',
        );
        if (email === 'demo@example.com' && password === 'password')
          nav?.navigate('/app/dashboard');
      }}
      error={flag.error}
      loading={flag.loading}
    />
  );
};

const SignUpScreen: FC = () => {
  const nav = useContext(BoilerplateNavContext);
  const { flag, run } = useDelayedFlag();
  return (
    <SignUpTemplate
      onSubmit={async ({ email }) => {
        const exists = email === 'existing@example.com';
        await run(exists ? 'An account with this email already exists' : undefined);
        if (!exists) nav?.navigate('/auth/sign-in');
      }}
      error={flag.error}
      loading={flag.loading}
    />
  );
};

const PasswordResetScreen =
  (mode: 'request' | 'confirm'): FC =>
  () => {
    const { flag, run } = useDelayedFlag();
    return (
      <PasswordResetTemplate
        mode={mode}
        onSubmit={(value) => run(value ? undefined : 'Please enter a value')}
        error={flag.error}
        success={flag.success}
        loading={flag.loading}
      />
    );
  };

const SettingsScreen: FC = () => {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [dateTimeFormat, setDateTimeFormat] = useState('YYYY-MM-DD');
  const [timezone, setTimezone] = useState('UTC');
  return (
    <SettingsTemplate
      language={language}
      theme={theme}
      dateTimeFormat={dateTimeFormat}
      timezone={timezone}
      onLanguageChange={setLanguage}
      onThemeChange={setTheme}
      onDateTimeFormatChange={setDateTimeFormat}
      onTimezoneChange={setTimezone}
    />
  );
};

export const screenOverrides: Record<string, Record<string, FC<Record<string, unknown>>>> = {
  auth: {
    'sign-in': SignInScreen,
    'sign-up': SignUpScreen,
    'forgot-password': PasswordResetScreen('request'),
    'reset-password': PasswordResetScreen('confirm'),
  },
  landing: {
    settings: SettingsScreen,
  },
};
