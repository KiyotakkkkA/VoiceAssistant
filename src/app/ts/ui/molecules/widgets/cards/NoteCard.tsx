import { useCallback } from "react";
import type { NoteItem } from "../../../../types/Global";

import NotesStore from "../../../../store/NotesStore";

interface Props {
  note: NoteItem;
  onSelect: (id: number) => void;
}

const NoteCard: React.FC<Props> = ({ note, onSelect }) => {

    const handleClick = useCallback(() => {
        onSelect(note.id);
    }, [note.id, onSelect]);

    return (
        <div
            key={note.id}
            onClick={handleClick}
        className={`p-3 rounded-lg cursor-pointer transition-colors ${
        NotesStore.selectedNoteId === note.id
            ? 'bg-widget-accent-a/20 border border-widget-accent-a'
            : 'hover:bg-ui-bg-secondary-light'
        }`}
    >
        <div className="font-medium text-sm mb-1">{note.name}</div>
        <div className="text-xs text-ui-text-muted mb-2">{note.modified}</div>
        <div className="text-xs text-ui-text-muted truncate">{note.preview}</div>
    </div>
    );
};

export { NoteCard };