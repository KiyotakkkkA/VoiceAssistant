import React, { forwardRef } from 'react';
import { ContextMenu } from '../../atoms';
import { IconPlus, IconPen, IconTrash } from '../../atoms/icons';

interface NotesContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  noteName: string;
  onCreateFolder: () => void;
  onCreateNote: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const NotesContextMenu = forwardRef<HTMLDivElement, NotesContextMenuProps>(({
  visible,
  x,
  y,
  noteName,
  onCreateFolder,
  onCreateNote,
  onRename,
  onDelete
}, ref) => {
  return (
    <ContextMenu
      ref={ref}
      visible={visible}
      x={x}
      y={y}
    >
      { 
        !noteName && (
          <button
            onClick={onCreateFolder}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-ui-bg-secondary-light flex items-center gap-2"
          >
            <IconPlus size={20}/>
            Создать папку
          </button>
      )}

      { 
        !noteName && (
          <button
            onClick={onCreateNote}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-ui-bg-secondary-light flex items-center gap-2"
          >
            <IconPlus size={20}/>
            Создать заметку
          </button>
      )}

      <button
        onClick={onRename}
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-ui-bg-secondary-light flex items-center gap-2"
      >
        <IconPen size={20}/>
        Переименовать
      </button>

      <div className="border-t border-ui-border-primary my-1"></div>

      <button
        onClick={onDelete}
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-600 hover:bg-opacity-20 text-red-400 flex items-center gap-2"
      >
        <IconTrash size={20}/>
        Удалить
      </button>
    </ContextMenu>
  );
});

export { NotesContextMenu };