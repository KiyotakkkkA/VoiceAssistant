import React, { memo } from 'react';
import { TextInputSimple } from '../../atoms/input';
import { IconSearch } from '../../atoms/icons';

interface NotesSearchPanelProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const NotesSearchPanel: React.FC<NotesSearchPanelProps> = memo(({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="p-4 border-b border-ui-border-primary">
      <div className="relative">
        <TextInputSimple
          placeholder="Поиск заметок..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-ui-bg-secondary-light text-ui-text-primary px-3 pr-8 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-widget-accent-a placeholder-ui-text-muted"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <IconSearch size={20} />
        </div>
      </div>
    </div>
  );
});

export { NotesSearchPanel };