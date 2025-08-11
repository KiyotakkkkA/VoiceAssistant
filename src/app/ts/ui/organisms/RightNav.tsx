import React from 'react';
import { NavItem } from '../molecules';
import { IconApp, IconHome } from '../atoms/icons';

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const RightNav: React.FC<Props> = ({ active, onChange }) => {
  return (
    <nav className='h-full w-14 flex flex-col items-stretch bg-[#252526] border-l border-black select-none'>
        <div className='flex-1 flex flex-col pt-2 gap-1'>
            <NavItem icon={<IconHome />} label='Главная' active={active==='home'} onClick={()=>onChange('home')} />
            <NavItem icon={<IconApp />} label='Приложения' active={active==='apps'} onClick={()=>onChange('apps')} />
        </div>
        <div className='p-2 text-[10px] text-gray-600 tracking-wider uppercase'>v1</div>
    </nav>
  );
};

export default RightNav;
