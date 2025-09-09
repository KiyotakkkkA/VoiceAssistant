import React, { memo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import NotesStore from "../../../store/NotesStore";
import { NoteItem, NoteFolderItem } from '../../../types/Global';
import { IconFolder } from '../../atoms/icons';

interface RenderFolderTreeProps {
    items: { [key: string]: NoteItem | NoteFolderItem };
    level?: number;
    parentPath?: string;
    selectedFolder: string | null;
    isRenaming: string | null;
    renameValue: string;
    isRenamingNote: string | null;
    renameNoteValue: string;
    onSelectFolder: (folderId: string) => void;
    onToggleFolder: (folderId: string) => void;
    onSelectNote: (noteId: number) => void;
    onHandleContextMenu: (e: React.MouseEvent, folderId: string, folderName: string, noteName: string) => void;
    onConfirmRename: (folderId: string, newName: string) => void;
    onConfirmRenameNote: (fullPath: string, newName: string) => void;
    onCancelRename: () => void;
    onCancelRenameNote: () => void;
    onSetRenameValue: (value: string) => void;
    onSetRenameNoteValue: (value: string) => void;
}

const RenderFolderTree = observer(({ 
    items, 
    level = 0, 
    parentPath = '',
    selectedFolder,
    isRenaming,
    renameValue,
    isRenamingNote,
    renameNoteValue,
    onSelectFolder,
    onToggleFolder,
    onSelectNote,
    onHandleContextMenu,
    onConfirmRename,
    onConfirmRenameNote,
    onCancelRename,
    onCancelRenameNote,
    onSetRenameValue,
    onSetRenameNoteValue
}: RenderFolderTreeProps) => {

    const selectFolder = useCallback((folderId: string) => {
        onSelectFolder(folderId);
    }, [onSelectFolder]);

    const toggleFolder = useCallback((folderId: string) => {
        onToggleFolder(folderId);
    }, [onToggleFolder]);

    const selectNote = useCallback((noteId: number) => {
        onSelectNote(noteId);
    }, [onSelectNote]);

    const handleContextMenu = useCallback((e: React.MouseEvent, folderId: string, folderName: string, noteName: string) => {
        onHandleContextMenu(e, folderId, folderName, noteName);
    }, [onHandleContextMenu]);

    const confirmRename = useCallback((folderId: string, newName: string) => {
        onConfirmRename(folderId, newName);
    }, [onConfirmRename]);

    const cancelRename = useCallback(() => {
        onCancelRename();
    }, [onCancelRename]);

    const setRenameValue = useCallback((value: string) => {
        onSetRenameValue(value);
    }, [onSetRenameValue]);

    const setRenameNoteValue = useCallback((value: string) => {
        onSetRenameNoteValue(value);
    }, [onSetRenameNoteValue]);

    const confirmRenameNote = useCallback((fullPath: string, newName: string) => {
        onConfirmRenameNote(fullPath, newName);
    }, [onConfirmRenameNote]);

    const cancelRenameNote = useCallback(() => {
        onCancelRenameNote();
    }, [onCancelRenameNote]);

    if (!items || Object.keys(items).length === 0) {
        console.log('No items to render');
        return null;
    }

    return (
        <>
            {Object.entries(items).map(([key, item]: [string, NoteItem | NoteFolderItem]) => {
                const fullPath = parentPath ? `${parentPath}/${key}` : key;
                const isExpanded = NotesStore.expandedFolders.has(fullPath);
                const isSelected = selectedFolder === fullPath;
                
                if (item.type === 'folder') {
                    const folderItem = item as NoteFolderItem;
                    const childrenCount = Object.keys(folderItem.children).length;
                    
                    return (
                        <div key={fullPath}>
                            <div
                                className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer text-sm transition-colors ${
                                    isSelected ? 'bg-widget-accent-a bg-opacity-20' : 'hover:bg-ui-bg-secondary-light'
                                }`}
                                style={{ marginLeft: `${level * 12}px` }}
                                onClick={() => {
                                    toggleFolder(fullPath);
                                    selectFolder(fullPath);
                                }}
                                onContextMenu={(e) => handleContextMenu(e, fullPath, folderItem.name, '')}
                            >
                                <div className="flex items-center gap-2">
                                    <svg
                                        className={`h-3 w-3 text-ui-text-muted transition-transform ${
                                            isExpanded ? 'rotate-90' : ''
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <IconFolder size={16} className='text-ui-text-primary'/>
                                    {isRenaming === fullPath ? (
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                className="bg-ui-bg-secondary text-ui-text-primary px-1 py-0.5 text-xs rounded"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') confirmRename(fullPath, renameValue);
                                                    if (e.key === 'Escape') cancelRename();
                                                }}
                                                onBlur={() => {
                                                    confirmRename(fullPath, renameValue);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <span>{folderItem.name}</span>
                                    )}
                                </div>
                                <span className="text-xs text-ui-text-muted">{childrenCount}</span>
                            </div>
                            {isExpanded && (
                                <div className="mt-1">
                                    <RenderFolderTree 
                                        items={folderItem.children}
                                        level={level + 1}
                                        parentPath={fullPath}
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
                            )}
                        </div>
                    );
                } else if (item.type === 'note') {
                    const noteItem = item as NoteItem;
                    return (
                        <div
                            key={fullPath}
                            onClick={() => selectNote(noteItem.id)}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                                NotesStore.selectedNoteId === noteItem.id
                                    ? 'bg-widget-accent-a/20 border border-widget-accent-a'
                                    : 'hover:bg-ui-bg-secondary-light'
                            }`}
                            style={{ marginLeft: `${(level + 1) * 12}px` }}
                            onContextMenu={(e) => handleContextMenu(e, parentPath, '', noteItem.name)}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="h-3 w-3 text-ui-text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                {isRenamingNote === fullPath ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={renameNoteValue}
                                            onChange={(e) => setRenameNoteValue(e.target.value)}
                                            className="bg-ui-bg-secondary text-ui-text-primary px-1 py-0.5 text-xs rounded"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') confirmRenameNote(fullPath, renameNoteValue);
                                                if (e.key === 'Escape') cancelRenameNote();
                                            }}
                                            onBlur={() => {
                                                confirmRenameNote(fullPath, renameNoteValue);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="font-medium text-xs">{noteItem.name}</div>
                                )}
                            </div>
                            <div className="text-xs text-ui-text-muted mb-1">{noteItem.modified}</div>
                            <div className="text-xs text-ui-text-muted truncate">{noteItem.preview}</div>
                        </div>
                    );
                }
                return null;
            })}
        </>
    );
});

export { RenderFolderTree };