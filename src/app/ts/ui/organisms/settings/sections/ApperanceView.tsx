import React from 'react';
import { CategoryItem } from '../../../atoms';
import { socketClient } from '../../../../clients';
import { EventsTopic, EventsType } from '../../../../../js/enums/Events';
import { Dropdown, Checkbox } from '../../../atoms/input';
import { observer } from 'mobx-react-lite';

interface Props {
  themeNames: string[];
  currentTheme: string | null;
  currentEventPanelState: boolean;
}

const ApperanceView: React.FC<Props> = observer(({ themeNames, currentTheme, currentEventPanelState }) => {
  const handleThemeChange = (newTheme: string) => {
    if (socketClient) {
      socketClient.send({
        type: EventsType.SERVICE_ACTION,
        topic: EventsTopic.ACTION_THEME_SET,
        payload: { theme: newTheme }
      });
    }
  };

  const handleEventPanelToggle = (value: boolean) => {
    if (socketClient) {
      socketClient.send({
        type: EventsType.SERVICE_ACTION,
        topic: EventsTopic.ACTION_EVENT_PANEL_TOGGLE,
        payload: { state: value }
      });
    }
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
        <Checkbox
          className='w-5 h-5'
          model={currentEventPanelState}
          onChange={handleEventPanelToggle}
        />
      </CategoryItem>
    </div>
  );
});

export { ApperanceView };
