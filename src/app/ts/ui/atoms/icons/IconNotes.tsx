import React from 'react';

interface IconNotesProps {
  className?: string;
}

const IconNotes: React.FC<IconNotesProps> = ({ className = "w-4 h-4" }) => {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  );
};

export { IconNotes };
