import React, { useContext } from 'react';
import { GContext } from '../../providers';
import { SettingsItem, Dropdown } from '../atoms';
import { socketClient } from '../../utils';

interface Props {
  themeNames: string[];
  currentTheme: string | null;
}

const ThemeSelector: React.FC<Props> = ({ themeNames, currentTheme }) => {
  const ctx = useContext(GContext);

  const handleThemeChange = (newTheme: string) => {
    if (socketClient) {
      socketClient.send({
        type: 'action_set_theme',
        payload: { theme: newTheme }
      });
    }
  };

  const themeOptions = themeNames.map(theme => ({
    value: theme,
    label: theme
  }));

  return (
    <SettingsItem 
      label="Цветовая тема"
      description="Выберите цветовую схему интерфейса приложения"
    >
      <Dropdown
        options={themeOptions}
        value={currentTheme || ''}
        onChange={handleThemeChange}
        placeholder="Выберите тему"
      />
    </SettingsItem>
  );
};

export default ThemeSelector;
