import React from 'react';
interface Props { title?: string; children: React.ReactNode; className?: string }
export const Card: React.FC<Props> = ({ title, children, className='' }) => (
  <div className={`bg-[#2f2f2f] rounded border border-[#3d3d3d] ${className}`}>
    {title && <div className='text-[10px] uppercase opacity-60 px-3 pt-2'>{title}</div>}
    <div className='p-3 text-xs leading-relaxed whitespace-pre-wrap break-words'>{children}</div>
  </div>
);
