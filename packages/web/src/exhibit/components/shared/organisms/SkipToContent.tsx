'use client';

import { FC } from 'react';

const SkipToContent: FC = () => {
  return (
    <a
      href="#main-content"
      className="focus:btn focus:btn-primary focus:btn-sm sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100]">
      Skip to content
    </a>
  );
};

export default SkipToContent;
