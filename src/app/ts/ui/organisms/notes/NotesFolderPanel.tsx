import React from 'react';
import { ScrollArea } from '../../atoms';
import { RenderFolderTree } from '../../molecules';
import { IconPlus, IconRefetch } from '../../atoms/icons';

interface NotesFolderPanelProps {
  folderStructure: any;
  selectedFolder: string | null;
  isRenaming: string | null;
  renameValue: string;
  isRenamingNote: string | null;
  renameNoteValue: string;
  onSelectFolder: (folderId: string) => void;
  onToggleFolder: (folderId: string) => void;
  onSelectNote: (noteId: number) => void;
  onCreateFolder: () => void;
  onRefetch: () => void;
  onClearFolderSelection: () => void;
  onHandleContextMenu: (e: React.MouseEvent, folderId: string, folderName: string, noteName: string) => void;
  onConfirmRename: (fullPath: string, newName: string) => void;
  onConfirmRenameNote: (fullPath: string, newName: string) => void;
  onCancelRename: () => void;
  onCancelRenameNote: () => void;
  onSetRenameValue: (value: string) => void;
  onSetRenameNoteValue: (value: string) => void;
}

const NotesFolderPanel: React.FC<NotesFolderPanelProps> = ({
  folderStructure,
  selectedFolder,
  isRenaming,
  renameValue,
  isRenamingNote,
  renameNoteValue,
  onSelectFolder,
  onToggleFolder,
  onSelectNote,
  onCreateFolder,
  onRefetch,
  onClearFolderSelection,
  onHandleContextMenu,
  onConfirmRename,
  onConfirmRenameNote,
  onCancelRename,
  onCancelRenameNote,
  onSetRenameValue,
  onSetRenameNoteValue
}) => {
  return (
    <div className="p-4 border-b border-ui-border-primary">
      <div className="flex items-center justify-between mb-3">
        <div className='flex items-center gap-2'>
          <h3 className="text-xs font-semibold text-ui-text-muted uppercase tracking-wider">Директории</h3>
          <div className='flex items-center'>
            <button onClick={onCreateFolder} className='p-1 rounded hover:bg-ui-bg-secondary-light'>
              <IconPlus size={20}/>
            </button>
            <button onClick={onRefetch} className='p-1 rounded hover:bg-ui-bg-secondary-light'>
              <IconRefetch size={18}/>
            </button>
          </div>
        </div>
        {selectedFolder && (
          <button
            onClick={onClearFolderSelection}
            className="text-xs text-ui-text-accent hover:underline flex items-center gap-1"
          >
            Показать всё
          </button>
        )}
      </div>
      <ScrollArea className='max-h-96 pr-4'>
        <div className="space-y-1">
          <RenderFolderTree
            items={folderStructure}
            level={0}
            parentPath=""
            selectedFolder={selectedFolder}
            isRenaming={isRenaming}
            renameValue={renameValue}
            isRenamingNote={isRenamingNote}
            renameNoteValue={renameNoteValue}
            onSelectFolder={onSelectFolder}
            onToggleFolder={onToggleFolder}
            onSelectNote={onSelectNote}
            onHandleContextMenu={onHandleContextMenu}
            onConfirmRename={onConfirmRename}
            onConfirmRenameNote={onConfirmRenameNote}
            onCancelRename={onCancelRename}
            onCancelRenameNote={onCancelRenameNote}
            onSetRenameValue={onSetRenameValue}
            onSetRenameNoteValue={onSetRenameNoteValue}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export { NotesFolderPanel };