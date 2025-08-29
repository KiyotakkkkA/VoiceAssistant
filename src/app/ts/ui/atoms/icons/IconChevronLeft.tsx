import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const IconChevronLeft: React.FC<IconProps> = ({ size = 16, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  );
};

export { IconChevronLeft };
