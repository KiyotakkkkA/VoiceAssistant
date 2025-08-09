import React from 'react';
export const StatusBarItem: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span className='px-2'>{children}</span>
);
