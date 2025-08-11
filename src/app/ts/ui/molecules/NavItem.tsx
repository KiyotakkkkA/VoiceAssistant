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
      className={`group relative w-full aspect-square flex items-center justify-center text-gray-500 hover:text-white transition-colors ${active ? 'text-white bg-[#373737]' : ''}`}
    >
      {icon}
      <span className="absolute left-0 -translate-x-full ml-[-6px] px-2 py-0.5 rounded text-[10px] tracking-wide bg-[#2d2d2d] text-gray-200 opacity-0 group-hover:opacity-100 pointer-events-none shadow z-10 whitespace-nowrap">{label}</span>
    </button>
  );
};

export default NavItem;
