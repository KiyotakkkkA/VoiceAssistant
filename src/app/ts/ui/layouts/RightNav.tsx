import React from 'react';
import { NavItem } from '../molecules';
import { IconApp, IconHome, IconSettings, IconNotes, IconZix } from '../atoms/icons';
import { useNavigation } from '../../providers/NavigationProvider';

const RightNav: React.FC = () => {
  const { navigateTo, isActive } = useNavigation();
  
  const items = [
    { icon: <IconZix />, label: 'Zix', active: isActive('zix'), onClick: () => navigateTo('zix') },
    { icon: <IconHome />, label: 'Главная', active: isActive('home'), onClick: () => navigateTo('home') },
    { icon: <IconSettings />, label: 'Настройки', active: isActive('settings'), onClick: () => navigateTo('settings') },
    { icon: <IconApp />, label: 'Приложения', active: isActive('apps'), onClick: () => navigateTo('apps') },
    { icon: <IconNotes />, label: 'Заметки', active: isActive('notes'), onClick: () => navigateTo('notes') },
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
