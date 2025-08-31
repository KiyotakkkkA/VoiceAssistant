import React from 'react';

const IconWarning: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path d="M12 9V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export { IconWarning };