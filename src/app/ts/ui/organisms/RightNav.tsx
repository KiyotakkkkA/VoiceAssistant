import React from 'react';
import { NavItem } from '../molecules';
import { IconApp, IconHome, IconSettings } from '../atoms/icons';

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const RightNav: React.FC<Props> = ({ active, onChange }) => {
  const items = [
    { icon: <IconSettings />, label: 'Настройки', active: active === 'settings', onClick: () => onChange('settings') },
    { icon: <IconHome />, label: 'Главная', active: active === 'home', onClick: () => onChange('home') },
    { icon: <IconApp />, label: 'Приложения', active: active === 'apps', onClick: () => onChange('apps') },
  ];
  return (
    <nav className='h-full w-14 flex flex-col items-stretch th-panel border-l border-sidebars-border th-panel-border select-none bg-sidebars-bg'> 
        <div className='flex-1 flex flex-col pt-2 gap-1'>
          {items.map(item => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
        <div className='p-2 text-[10px] text-version-text tracking-wider uppercase'>v1</div>
    </nav>
  );
};

export default RightNav;
