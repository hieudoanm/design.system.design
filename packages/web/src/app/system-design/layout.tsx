import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Design',
  description:
    'Popular system design interview problems with requirements, estimates, architecture and questions with answers.',
  alternates: { canonical: '/system-design' },
};

const SystemDesignLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default SystemDesignLayout;
