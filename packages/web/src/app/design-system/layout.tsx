import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design System',
  description:
    'How to build a good design system: atomic design, tokens, typography, charts, accessibility and responsive design.',
  alternates: { canonical: '/design-system' },
};

const DesignSystemLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default DesignSystemLayout;
