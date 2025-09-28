import React, { memo } from 'react';
import { ScrollArea } from '../../atoms';
import { NoteCard } from '../../molecules/cards';
import { NoteItem } from '../../../types/Global';

interface NotesListPanelProps {
  filteredNotes: NoteItem[];
  selectedFolder: string | null;
  onSelectNote: (noteId: number) => void;
}

const NotesListPanel: React.FC<NotesListPanelProps> = memo(({
  filteredNotes,
  selectedFolder,
  onSelectNote
}) => {
  return (
    <ScrollArea className="flex-1 mr-4">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-ui-text-muted uppercase tracking-wider mb-3">
          {selectedFolder ? `Заметки в '${selectedFolder.split('/').pop()}'` : 'Все заметки'}
        </h3>
        <div className="space-y-1">
          {filteredNotes.map((note: NoteItem) => (
            <NoteCard key={note.id} note={note} onSelect={onSelectNote} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
});

export { NotesListPanel };