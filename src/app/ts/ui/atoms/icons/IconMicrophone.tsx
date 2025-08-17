import React from 'react';

const IconMicrophone: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2Z"/>
    <path d="M19 11C19 14.87 15.87 18 12 18C8.13 18 5 14.87 5 11"/>
    <path d="M16 23H8"/>
    <path d="M12 18V22"/>
  </svg>
);

export { IconMicrophone };