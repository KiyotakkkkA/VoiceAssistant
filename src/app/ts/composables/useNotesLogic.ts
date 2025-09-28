import { useState, useEffect, useCallback } from 'react';
import { useSocketActions, useToast } from './';
import NotesStore from '../store/NotesStore';

export const useNotesLogic = () => {
  const { addToast } = useToast();
  const { folderRename, folderCreate, folderDelete, fileWrite, fileDelete, fileRename, notesRefetch } = useSocketActions();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('editor');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const currentNote = NotesStore.selectedNoteId !== null ? NotesStore.getNoteById(NotesStore.selectedNoteId) : null;
  const [noteContent, setNoteContent] = useState(currentNote?.content || '');

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    folderId: string;
    folderName: string;
    noteName: string;
  }>({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });

  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenamingNote, setIsRenamingNote] = useState<string | null>(null);
  const [renameNoteValue, setRenameNoteValue] = useState<string>('');

  useEffect(() => {
    if (currentNote) {
      if (NotesStore.selectedNoteId !== null && noteContent && noteContent !== currentNote.content) {
        const prevNoteId = NotesStore.selectedNoteId;
        if (prevNoteId !== currentNote.id) {
          NotesStore.updateNoteContent(prevNoteId, noteContent);
        }
      }
      
      setNoteContent(currentNote.content || '');
      setUnsavedChanges(false);
    }
  }, [currentNote?.id]);

  useEffect(() => {
    if (currentNote && noteContent !== currentNote.content) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
  }, [noteContent, currentNote?.content]);

  useEffect(() => {
    return () => {
      if (NotesStore.selectedNoteId !== null && noteContent && unsavedChanges) {
        NotesStore.updateNoteContent(NotesStore.selectedNoteId, noteContent);
      }
    };
  }, [noteContent, unsavedChanges]);

  const handleSave = useCallback(() => {
    if (NotesStore.selectedNoteId !== null && noteContent) {
      NotesStore.updateNoteContent(NotesStore.selectedNoteId, noteContent);
      
      const currentNote = NotesStore.getNoteById(NotesStore.selectedNoteId);
      if (currentNote?.path) {
        fileWrite(currentNote.path, noteContent, 'w');
      }
      
      setUnsavedChanges(false);
      addToast('Заметка сохранена!', 'success');
    }
  }, [noteContent, fileWrite, addToast]);

  const handleContextMenu = useCallback((e: React.MouseEvent, folderId: string, folderName: string, noteName: string = '') => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      folderId,
      folderName,
      noteName,
    });
  }, []);

  const handleRenameNote = useCallback(() => {
    setIsRenamingNote(contextMenu.folderId + '/' + contextMenu.noteName);
    setRenameNoteValue(contextMenu.noteName);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, [contextMenu]);

  const handleDeleteNote = useCallback(() => {
    if (contextMenu.noteName) {
      fileDelete(contextMenu.folderId + '/' + contextMenu.noteName);
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, [contextMenu.noteName, contextMenu.folderId, fileDelete]);

  const handleCreateNote = useCallback(() => {
    const baseNoteTitle = 'New_Note.txt';
    if (baseNoteTitle && baseNoteTitle.trim()) {
      fileWrite(contextMenu.folderId + '/' + baseNoteTitle, '', 'c');
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, [contextMenu.folderId, fileWrite]);

  const handleDeleteFolder = useCallback(() => {
    folderDelete(contextMenu.folderId);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, [contextMenu.folderId, folderDelete]);

  const handleCreateFolder = useCallback(() => {
    const baseFolderName = 'new-folder'
    if (baseFolderName && baseFolderName.trim()) {
      folderCreate(contextMenu.folderId, baseFolderName);
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, [contextMenu.folderId, folderCreate]);

  const handleRenameFolder = useCallback(() => {
    setIsRenaming(contextMenu.folderId);
    setRenameValue(contextMenu.folderName);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, [contextMenu]);

  const confirmRename = useCallback((path: string, newName: string) => {
    if (newName.trim()) {
      folderRename(path, newName);
    }
    setIsRenaming(null);
    setRenameValue('');
  }, [folderRename]);

  const confirmRenameNote = useCallback((fullPath: string, newName: string) => {
    if (newName.trim()) {
      fileRename(fullPath, newName);
    }
    setIsRenamingNote(null);
    setRenameNoteValue('');
  }, [fileRename]);

  const cancelRename = useCallback(() => {
    setIsRenaming(null);
    setRenameValue('');
  }, []);

  const cancelRenameNote = useCallback(() => {
    setIsRenamingNote(null);
    setRenameNoteValue('');
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    NotesStore.toggleFolderExpansion(folderId);
  }, []);

  const selectFolder = useCallback((folderId: string) => {
    setSelectedFolder(selectedFolder === folderId ? null : folderId);
  }, [selectedFolder]);

  const clearFolderSelection = useCallback(() => {
    setSelectedFolder(null);
  }, []);

  const selectNote = useCallback((noteId: number) => {
    if (NotesStore.selectedNoteId !== null && noteContent && unsavedChanges) {
      NotesStore.updateNoteContent(NotesStore.selectedNoteId, noteContent);
    }
    
    NotesStore.setSelectedNote(noteId);
  }, [noteContent, unsavedChanges]);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }, []);

  return {
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
    
    notesRefetch
  };
};