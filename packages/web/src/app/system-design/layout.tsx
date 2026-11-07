import { Metadata } from 'next';
import { withBasePath } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'System Design',
  description:
    'Popular system design interview problems with requirements, estimates, architecture and questions with answers.',
  alternates: { canonical: withBasePath('/system-design') },
};

const SystemDesignLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default SystemDesignLayout;
