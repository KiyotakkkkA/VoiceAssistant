import React from 'react';

const IconPlus: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path d="M12 5V19" />
    <path d="M5 12H19" />
  </svg>
);

export { IconPlus}