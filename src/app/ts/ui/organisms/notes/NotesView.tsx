import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { TextInput } from '../../atoms/input';
import { ScrollArea, ContextMenu } from '../../atoms';
import { NoteItem } from '../../../types/Global';
import { RenderFolderTree } from '../../molecules/notes';
import { NoteCard } from '../../molecules/widgets/cards';
import { useMarkdown, useSocketActions, useToast } from '../../../composables';
import { IconPen, IconPlus, IconTrash, IconSearch, IconRefetch} from '../../atoms/icons';

import NotesStore from '../../../store/NotesStore';

const NotesView = observer(() => {
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('editor');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const currentNote = NotesStore.selectedNoteId !== null ? NotesStore.getNoteById(NotesStore.selectedNoteId) : null;
  const [noteContent, setNoteContent] = useState(currentNote?.content || '');

  const { folderRename, folderCreate, folderDelete, fileWrite, fileDelete, fileRename, notesRefetch } = useSocketActions();

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

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const parsedContent = useMarkdown(noteContent || '');

  const folderStructure = NotesStore.notes;
  const allNotes = NotesStore.getAllNotes();

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
  }, [noteContent, fileWrite]);

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
        setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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

  const handleContextMenu = (e: React.MouseEvent, folderId: string, folderName: string, noteName: string = '') => {
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
  };

  const handleRenameNote = () => {
    setIsRenamingNote(contextMenu.folderId + '/' + contextMenu.noteName);
    setRenameNoteValue(contextMenu.noteName);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  }

  const handleDeleteNote = () => {
    if (contextMenu.noteName) {
      fileDelete(contextMenu.folderId + '/' + contextMenu.noteName);
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  };

  const handleCreateNote = () => {
    const baseNoteTitle = 'New_Note.txt';
    if (baseNoteTitle && baseNoteTitle.trim()) {
      fileWrite(contextMenu.folderId + '/' + baseNoteTitle, '', 'c');
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  };

  const handleDeleteFolder = () => {
    folderDelete(contextMenu.folderId);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  };

  const handleCreateFolder = () => {
    const baseFolderName = 'new-folder'
    if (baseFolderName && baseFolderName.trim()) {
      folderCreate(contextMenu.folderId, baseFolderName);
    }
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  };

  const handleRenameFolder = () => {
    setIsRenaming(contextMenu.folderId);
    setRenameValue(contextMenu.folderName);
    setContextMenu({ visible: false, x: 0, y: 0, folderId: '', folderName: '', noteName: '' });
  };

  const confirmRename = (path: string, newName: string) => {
    if (newName.trim()) {
      folderRename(path, newName);
    }
    setIsRenaming(null);
    setRenameValue('');
  };

  const confirmRenameNote = (fullPath: string, newName: string) => {
    if (newName.trim()) {
      fileRename(fullPath, newName);
    }
    setIsRenamingNote(null);
    setRenameNoteValue('');
  };

  const cancelRename = () => {
    setIsRenaming(null);
    setRenameValue('');
  };

  const cancelRenameNote = () => {
    setIsRenamingNote(null);
    setRenameNoteValue('');
  };

  const toggleFolder = useCallback((folderId: string) => {
    NotesStore.toggleFolderExpansion(folderId);
  }, []);

  const selectFolder = useCallback((folderId: string) => {
    setSelectedFolder(selectedFolder === folderId ? null : folderId);
  }, [selectedFolder]);

  const selectNote = useCallback((noteId: number) => {
    if (NotesStore.selectedNoteId !== null && noteContent && unsavedChanges) {
      NotesStore.updateNoteContent(NotesStore.selectedNoteId, noteContent);
    }
    
    NotesStore.setSelectedNote(noteId);
  }, [noteContent, unsavedChanges]);

  const handleContextMenuCallback = useCallback((e: React.MouseEvent, folderId: string, folderName: string, noteName: string) => {
    handleContextMenu(e, folderId, folderName, noteName);
  }, []);

  const confirmRenameCallback = useCallback((fullPath: string, newName: string) => {
    confirmRename(fullPath, newName);
  }, []);

  const cancelRenameCallback = useCallback(() => {
    cancelRename();
  }, []);

  const setRenameValueCallback = useCallback((value: string) => {
    setRenameValue(value);
  }, []);

  const setRenameNoteValueCallback = useCallback((value: string) => {
    setRenameNoteValue(value);
  }, []);

  const confirmRenameNoteCallback = useCallback((fullPath: string, newName: string) => {
    confirmRenameNote(fullPath, newName);
  }, []);

  const cancelRenameNoteCallback = useCallback(() => {
    cancelRenameNote();
  }, []);

  const getNotesFromFolder = (folderId: string) => {
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
  };

  const filteredNotes = selectedFolder 
    ? getNotesFromFolder(selectedFolder).filter((note: NoteItem) => 
        note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allNotes.filter((note: NoteItem) => 
        note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex h-screen bg-ui-bg-primary text-ui-text-primary">
      <ContextMenu
        ref={contextMenuRef}
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
      >
        { 
          !contextMenu.noteName && (
            <button
              onClick={handleCreateFolder}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-ui-bg-secondary-light flex items-center gap-2"
            >
              <IconPlus size={20}/>
              Создать папку
            </button>
        )}

        { 
          !contextMenu.noteName && (
            <button
              onClick={handleCreateNote}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-ui-bg-secondary-light flex items-center gap-2"
            >
              <IconPlus size={20}/>
              Создать заметку
            </button>
        )}

        <button
          onClick={contextMenu.noteName ? handleRenameNote : handleRenameFolder}
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-ui-bg-secondary-light flex items-center gap-2"
        >
          <IconPen size={20}/>
          Переименовать
        </button>

        <div className="border-t border-ui-border-primary my-1"></div>

        <button
          onClick={contextMenu.noteName ? handleDeleteNote : handleDeleteFolder}
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-600 hover:bg-opacity-20 text-red-400 flex items-center gap-2"
        >
          <IconTrash size={20}/>
          Удалить
        </button>
      </ContextMenu>

      <div className="w-80 bg-ui-bg-primary-light border-r border-ui-border-primary flex flex-col">
        <div className="p-4 border-b border-ui-border-primary">
          <div className="relative">
            <TextInput
              placeholder="Поиск заметок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ui-bg-secondary-light text-ui-text-primary px-3 pr-8 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-ui-text-muted"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <IconSearch size={20} />
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-ui-border-primary">
          <div className="flex items-center justify-between mb-3">
            <div className='flex items-center gap-2'>
              <h3 className="text-xs font-semibold text-ui-text-muted uppercase tracking-wider">Директории</h3>
              <div className='flex items-center'>
                <button onClick={handleCreateFolder} className='p-1 rounded hover:bg-ui-bg-secondary-light'>
                  <IconPlus size={20}/>
                </button>
                <button onClick={() => notesRefetch()} className='p-1 rounded hover:bg-ui-bg-secondary-light'>
                  <IconRefetch size={18}/>
                </button>
              </div>
            </div>
            {selectedFolder && (
              <button
                onClick={() => setSelectedFolder(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
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
                onSelectFolder={selectFolder}
                onToggleFolder={toggleFolder}
                onSelectNote={selectNote}
                onHandleContextMenu={handleContextMenuCallback}
                onConfirmRename={confirmRenameCallback}
                onConfirmRenameNote={confirmRenameNoteCallback}
                onCancelRename={cancelRenameCallback}
                onCancelRenameNote={cancelRenameNoteCallback}
                onSetRenameValue={setRenameValueCallback}
                onSetRenameNoteValue={setRenameNoteValueCallback}
              />
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1 mr-4">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-ui-text-muted uppercase tracking-wider mb-3">
              {selectedFolder ? `Заметки в '${selectedFolder.split('/').pop()}'` : 'Все заметки'}
            </h3>
            <div className="space-y-1">
              {filteredNotes.map((note: NoteItem) => (
                <NoteCard key={note.id} note={note} onSelect={selectNote} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-12 bg-ui-bg-primary-light border-b border-ui-border-primary flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{currentNote?.name || 'Untitled'}</h1>
            <div className="text-xs text-ui-text-muted">
              Последнее изменение: {currentNote?.modified}
            </div>
            {unsavedChanges && (
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <span>Не сохранено</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Сохранить (Ctrl+S)
            </button>
            <div className="flex bg-ui-bg-secondary-light rounded-md p-1">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'editor' ? 'bg-blue-600 text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
                }`}
              >
                Изменить
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
                }`}
              >
                Просмотр
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
                }`}
              >
                Разделить
              </button>
            </div>
            <button className="p-2 hover:bg-ui-bg-secondary-light rounded transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-ui-bg-secondary-light rounded transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-ui-border-primary' : 'flex-1'} p-6`}>
              <div className="h-full">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-full bg-transparent text-ui-text-primary resize-none focus:outline-none font-mono text-sm leading-relaxed placeholder-ui-text-muted custom-scrollbar"
                  placeholder="Это начало вашей заметки..."
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                />
              </div>
            </div>
          )}
          
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'flex-1'} p-6`}>
              <ScrollArea className="max-h-screen">
                <div 
                  className="prose prose-invert max-w-none text-ui-text-primary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parsedContent }}
                />
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export { NotesView };