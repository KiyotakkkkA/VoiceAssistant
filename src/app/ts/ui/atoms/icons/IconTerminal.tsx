import React from 'react';

const IconTerminal: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path d="M3 5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5Z"/>
    
    <path d="M7 8H17" strokeDasharray="2,2"/>
    <path d="M7 12H17" strokeDasharray="2,2"/>
    <path d="M7 16H17" strokeDasharray="2,2"/>

  </svg>
);

export { IconTerminal };