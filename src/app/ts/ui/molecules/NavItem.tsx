import React from 'react';

interface Props {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<Props> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`group nav-accent ${active ? 'nav-accent-active' : ''} relative w-full aspect-square flex items-center justify-center text-nav-text hover:text-nav-text-hover transition-colors ${active ? 'text-nav-text-active bg-nav-bg-active' : 'hover:bg-nav-bg-hover'}`}
    >
      <div className='transition-transform group-active:scale-90'>{icon}</div>
      <span className="absolute left-0 -translate-x-full ml-[-6px] px-2 py-0.5 rounded text-[10px] tracking-wide bg-nav-tooltip-bg border border-nav-tooltip-border text-nav-tooltip-text opacity-0 group-hover:opacity-100 pointer-events-none shadow z-10 whitespace-nowrap">{label}</span>
    </button>
  );
};

export default NavItem;
