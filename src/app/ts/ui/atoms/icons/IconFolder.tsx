import React from 'react';

const IconFolder: React.FC<{ className?: string; size?: number }> = ({ className='', size=22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
);

export { IconFolder };