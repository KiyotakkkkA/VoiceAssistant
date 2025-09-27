import React from 'react';
import { CategoryItem } from '../../../atoms';
import { Dropdown, CheckboxSimple } from '../../../atoms/input';
import { observer } from 'mobx-react-lite';
import { useSocketActions } from '../../../../composables';

import SettingsStore from '../../../../store/SettingsStore';

interface Props {
  themeNames: string[];
  currentTheme: string | null;
  currentEventPanelState: boolean;
}

const ApperanceView: React.FC<Props> = observer(({ themeNames, currentTheme, currentEventPanelState }) => {
  const { themeSet } = useSocketActions();

  const handleThemeChange = (newTheme: string) => {
    themeSet(newTheme);
  };

  const handleEventPanelToggle = (value: boolean) => {
    SettingsStore.updateEventPanelState(value);
  };

  const themeOptions = themeNames?.map(theme => ({
    value: theme,
    label: theme
  }));

  return (
    <div className="flex flex-col gap-2">
      <CategoryItem 
        label="Цветовая тема"
        description="Смена цветовой схемы интерфейса приложения"
      >
        <Dropdown
          options={themeOptions || []}
          value={currentTheme || ''}
          onChange={handleThemeChange}
          placeholder="Выберите тему"
        />
      </CategoryItem>
      <CategoryItem 
        label="Панель событий"
        description="Управление видимостью нижней панели событий"
      >
        <CheckboxSimple
          className='w-5 h-5'
          model={currentEventPanelState}
          onChange={handleEventPanelToggle}
        />
      </CategoryItem>
    </div>
  );
});

export { ApperanceView };
