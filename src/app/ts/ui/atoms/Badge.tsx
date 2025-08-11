import React from 'react';
interface Props { label: string; className?: string }
const Badge: React.FC<Props> = ({ label, className='' }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${className}`}>{label}</span>
);

export default Badge;
