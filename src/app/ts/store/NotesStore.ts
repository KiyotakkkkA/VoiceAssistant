import { makeAutoObservable } from 'mobx';
import { NotesStructure, NoteItem } from '../types/Global';

class NotesStore {
    notes: NotesStructure = {};
    selectedNoteId: number | null = null;
    expandedFolders: Set<string> = new Set();

    constructor() {
        makeAutoObservable(this);
    }

    getNoteById(id: number): NoteItem | null {
        const findNote = (structure: NotesStructure): NoteItem | null => {
            for (const key in structure) {
                const item = structure[key];
                if (item.type === 'note' && item.id === id) {
                    return item;
                } else if (item.type === 'folder') {
                    const found = findNote(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findNote(this.notes);
    }

    getAllNotes(): NoteItem[] {
        const notes: NoteItem[] = [];
        const collectNotes = (structure: NotesStructure) => {
            for (const key in structure) {
                const item = structure[key];
                if (item.type === 'note') {
                    notes.push(item);
                } else if (item.type === 'folder') {
                    collectNotes(item.children);
                }
            }
        };
        collectNotes(this.notes);
        return notes;
    }

    updateNoteContent(id: number, content: string) {
        const note = this.getNoteById(id);
        if (note) {
            note.content = content;
            note.modified = new Date().toLocaleString();
            note.preview = this.generatePreview(content);
        }
    }

    private generatePreview(content: string): string {
        return content
            .replace(/[#*`\[\]()]/g, '')
            .split('\n')
            .filter(line => line.trim())
            .slice(0, 2)
            .join(' ')
            .substring(0, 100) + (content.length > 100 ? '...' : '');
    }

    setSelectedNote(id: number | null) {
        this.selectedNoteId = id;
    }

    toggleFolderExpansion(folderId: string) {
        if (this.expandedFolders.has(folderId)) {
            this.expandedFolders.delete(folderId);
        } else {
            this.expandedFolders.add(folderId);
        }
    }
}

export default new NotesStore();