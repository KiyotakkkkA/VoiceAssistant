import React from 'react';

const IconHome: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 11.2 11.35 4.6c.4-.32.9-.32 1.3 0L21 11.2" />
    <path d="M5.4 9.6v8.9c0 .7.5 1.3 1.2 1.3h3.6v-4.3c0-.6.5-1.1 1.1-1.1h1.4c.6 0 1.1.5 1.1 1.1v4.3h3.6c.7 0 1.2-.6 1.2-1.3V9.6" />
  </svg>
);

export { IconHome };
