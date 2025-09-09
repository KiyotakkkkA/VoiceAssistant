import React from 'react';
import { NavItem } from '../../molecules';
import { IconApp, IconHome, IconSettings, IconNotes, IconZix } from '../../atoms/icons';

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const RightNav: React.FC<Props> = ({ active, onChange }) => {
  const items = [
    { icon: <IconZix />, label: 'Zix', active: active === 'zix', onClick: () => onChange('zix') },
    { icon: <IconHome />, label: 'Главная', active: active === 'home', onClick: () => onChange('home') },
    { icon: <IconSettings />, label: 'Настройки', active: active === 'settings', onClick: () => onChange('settings') },
    { icon: <IconApp />, label: 'Приложения', active: active === 'apps', onClick: () => onChange('apps') },
    { icon: <IconNotes />, label: 'Заметки', active: active === 'notes', onClick: () => onChange('notes') },
  ];
  return (
    <nav className='h-full w-14 flex flex-col items-stretch th-panel border-l border-ui-border-primary th-panel-border select-none bg-ui-bg-secondary'> 
        <div className='flex-1 flex flex-col pt-2 gap-1'>
          {items.map(item => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
    </nav>
  );
};

export { RightNav };
