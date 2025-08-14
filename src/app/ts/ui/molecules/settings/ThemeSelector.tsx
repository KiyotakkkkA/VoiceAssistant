import React from 'react';
import { CategoryItem, Dropdown } from '../../atoms';
import { socketClient } from '../../../utils';
import { EventsTopic, EventsType } from '../../../../js/enums/Events';

interface Props {
  themeNames: string[];
  currentTheme: string | null;
}

const ThemeSelector: React.FC<Props> = ({ themeNames, currentTheme }) => {
  const handleThemeChange = (newTheme: string) => {
    if (socketClient) {
      socketClient.send({
        type: EventsType.SERVICE_ACTION,
        topic: EventsTopic.ACTION_THEME_SET,
        payload: { theme: newTheme }
      });
    }
  };

  const themeOptions = themeNames.map(theme => ({
    value: theme,
    label: theme
  }));

  return (
    <CategoryItem 
      label="Цветовая тема"
      description="Выберите цветовую схему интерфейса приложения"
    >
      <Dropdown
        options={themeOptions}
        value={currentTheme || ''}
        onChange={handleThemeChange}
        placeholder="Выберите тему"
      />
    </CategoryItem>
  );
};

export { ThemeSelector };
