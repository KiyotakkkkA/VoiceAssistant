import React from 'react';
const StatusBarItem: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span className='px-2'>{children}</span>
); 

export { StatusBarItem };
