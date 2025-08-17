import React from 'react';

const IconFile: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
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
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"/>
    <path d="M14 2V8H20"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H9H8"/>
  </svg>
);

export { IconFile };