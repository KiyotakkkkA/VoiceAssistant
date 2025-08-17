import React from 'react';

const IconShield: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path d="M12 1L21 5V11C21 16.55 17.16 21.74 12 23C6.84 21.74 3 16.55 3 11V5L12 1M12 7C10.34 7 9 8.34 9 10S10.34 13 12 13 15 11.66 15 10 13.66 7 12 7Z"/>
  </svg>
);

export { IconShield };
