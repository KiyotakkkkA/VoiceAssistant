import React from 'react';

interface Props {
  title?: string;
  children: React.ReactNode;
  className?: string;
  gradientColor: string;
}

const Card: React.FC<Props> = ({ title, children, className='', gradientColor }) => (
  <div className={`relative rounded-md border border-ui-border-primary bg-ui-bg-secondary-light overflow-hidden group ${className}`}>
    <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
         style={{background:`radial-gradient(circle at 80% 20%, ${gradientColor}, transparent 60%)`}} />
    {title && <div className='text-[10px] font-medium tracking-wider text-card-title px-3 pt-2 select-none'>{title}</div>}
    <div className='p-3 text-xs leading-relaxed whitespace-pre-wrap break-words relative z-10'>{children}</div>
  </div>
);

export { Card };
