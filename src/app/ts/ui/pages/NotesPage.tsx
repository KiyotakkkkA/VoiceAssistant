import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { NoteItem } from '../../types/Global';
import { useMarkdown, useNotesLogic } from '../../composables';

import { NotesSearchPanel } from '../organisms/notes/NotesSearchPanel';
import { NotesFolderPanel } from '../organisms/notes/NotesFolderPanel';
import { NotesListPanel } from '../organisms/notes/NotesListPanel';
import { NotesEditor } from '../organisms/notes/NotesEditor';
import { NotesContextMenu } from '../organisms/notes/NotesContextMenu';

import NotesStore from '../../store/NotesStore';

const NotesPage = observer(() => {
  const {
    searchQuery,
    viewMode,
    selectedFolder,
    unsavedChanges,
    currentNote,
    noteContent,
    contextMenu,
    isRenaming,
    renameValue,
    isRenamingNote,
    renameNoteValue,
    
    setSearchQuery,
    setViewMode,
    setNoteContent,
    setRenameValue,
    setRenameNoteValue,
    
    handleSave,
    handleContextMenu,
    handleRenameNote,
    handleDeleteNote,
    handleCreateNote,
    handleDeleteFolder,
    handleCreateFolder,
    handleRenameFolder,
    confirmRename,
    confirmRenameNote,
    cancelRename,
    cancelRenameNote,
    toggleFolder,
    selectFolder,
    selectNote,
    closeContextMenu,
    clearFolderSelection,
    handleMoveNote,
    
    notesRefetch
  } = useNotesLogic();

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const parsedContent = useMarkdown(noteContent || '');

  const folderStructure = NotesStore.notes;
  const allNotes = NotesStore.getAllNotes();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeContextMenu]);

  const handleContextMenuCallback = useCallback((e: React.MouseEvent, folderId: string, folderName: string, noteName: string) => {
    handleContextMenu(e, folderId, folderName, noteName);
  }, [handleContextMenu]);

  const confirmRenameCallback = useCallback((fullPath: string, newName: string) => {
    confirmRename(fullPath, newName);
  }, [confirmRename]);

  const confirmRenameNoteCallback = useCallback((fullPath: string, newName: string) => {
    confirmRenameNote(fullPath, newName);
  }, [confirmRenameNote]);

  const setRenameValueCallback = useCallback((value: string) => {
    setRenameValue(value);
  }, [setRenameValue]);

  const setRenameNoteValueCallback = useCallback((value: string) => {
    setRenameNoteValue(value);
  }, [setRenameNoteValue]);

  const cancelRenameCallback = useCallback(() => {
    cancelRename();
  }, [cancelRename]);

  const cancelRenameNoteCallback = useCallback(() => {
    cancelRenameNote();
  }, [cancelRenameNote]);

  const getNotesFromFolder = useCallback((folderId: string) => {
    const pathParts = folderId.split('/');
    let current: any = folderStructure;
    
    for (const part of pathParts) {
      if (current[part]) {
        current = current[part];
        if (current.children) {
          current = current.children;
        }
      }
    }
    
    const collectNotes = (items: any): any[] => {
      const notes: any[] = [];
      Object.values(items).forEach((item: any) => {
        if (item.type === 'note') {
          notes.push(item);
        } else if (item.type === 'folder' && item.children) {
          notes.push(...collectNotes(item.children));
        }
      });
      return notes;
    };
    
    return collectNotes(current);
  }, [folderStructure]);

  const filteredNotes = useMemo(() => {
    const notes = selectedFolder 
      ? getNotesFromFolder(selectedFolder)
      : allNotes;
    
    return notes.filter((note: NoteItem) => 
      note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedFolder, getNotesFromFolder, allNotes, searchQuery]);

  return (
    <div className="flex h-screen bg-ui-bg-primary text-ui-text-primary">
      <NotesContextMenu
        ref={contextMenuRef}
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        noteName={contextMenu.noteName}
        onCreateFolder={handleCreateFolder}
        onCreateNote={handleCreateNote}
        onRename={contextMenu.noteName ? handleRenameNote : handleRenameFolder}
        onDelete={contextMenu.noteName ? handleDeleteNote : handleDeleteFolder}
      />

      <div className="w-80 bg-ui-bg-primary-light border-r border-ui-border-primary flex flex-col">
        <NotesSearchPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <NotesFolderPanel
          folderStructure={folderStructure}
          selectedFolder={selectedFolder}
          isRenaming={isRenaming}
          renameValue={renameValue}
          isRenamingNote={isRenamingNote}
          renameNoteValue={renameNoteValue}
          onSelectFolder={selectFolder}
          onToggleFolder={toggleFolder}
          onSelectNote={selectNote}
          onCreateFolder={handleCreateFolder}
          onRefetch={() => notesRefetch()}
          onClearFolderSelection={clearFolderSelection}
          onHandleContextMenu={handleContextMenuCallback}
          onConfirmRename={confirmRenameCallback}
          onConfirmRenameNote={confirmRenameNoteCallback}
          onCancelRename={cancelRenameCallback}
          onCancelRenameNote={cancelRenameNoteCallback}
          onSetRenameValue={setRenameValueCallback}
          onSetRenameNoteValue={setRenameNoteValueCallback}
          onMoveNote={handleMoveNote}
        />

        <NotesListPanel
          filteredNotes={filteredNotes}
          selectedFolder={selectedFolder}
          onSelectNote={selectNote}
        />
      </div>

      <NotesEditor
        currentNote={currentNote}
        noteContent={noteContent}
        viewMode={viewMode}
        unsavedChanges={unsavedChanges}
        parsedContent={parsedContent}
        onContentChange={setNoteContent}
        onViewModeChange={setViewMode}
        onSave={handleSave}
      />
    </div>
  );
});

export { NotesPage };