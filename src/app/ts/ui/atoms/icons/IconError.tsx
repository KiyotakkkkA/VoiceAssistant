import React from 'react';

const IconError: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path 
        d="M12 2L20 7L20 17L12 22L4 17L4 7L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
    />
    <path 
        d="M12 8V12M12 16H12.01" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
    />
  </svg>
);

export { IconError };