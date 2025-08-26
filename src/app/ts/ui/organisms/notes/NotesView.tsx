import React, { useState, useMemo } from 'react';
import { TextInput } from '../../atoms/input';

const ScrollArea = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 ${className}`}>
      {children}
    </div>
  );
};

const parseMarkdown = (text: string) => {
  if (!text) return '';
  
  let html = text
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-ui-text-primary mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-ui-text-primary mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-ui-text-primary mb-4 mt-4">$1</h1>')

    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ui-text-primary">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-ui-text-primary">$1</em>')

    .replace(/```([\s\S]*?)```/g, '<pre class="bg-ui-bg-secondary p-3 rounded-md my-3 overflow-x-auto"><code class="text-green-400 text-sm">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-ui-bg-secondary px-2 py-1 rounded text-green-400 text-sm">$1</code>')

    .replace(/^- (.*$)/gm, '<li class="text-ui-text-primary ml-4 mb-1">• $1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="text-ui-text-primary ml-4 mb-1">$1. $2</li>')

    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
    
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
    
  return html;
};

const NotesView = () => {
  const [selectedNote, setSelectedNote] = useState(0);
  const [noteContent, setNoteContent] = useState('# Welcome to Notes\n\nThis is your note-taking space. Start writing your thoughts, ideas, and everything that matters to you.\n\n## Features\n- Dark theme interface\n- Markdown support\n- File explorer\n- Search functionality\n\n**Start typing to create your first note!**\n\n### Code Example\n```javascript\nconst greeting = "Hello World!";\nconsole.log(greeting);\n```\n\nYou can also add `inline code` and [links](https://example.com).');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [viewMode, setViewMode] = useState('editor');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['daily-notes']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const parsedContent = useMemo(() => parseMarkdown(noteContent), [noteContent]);

  // Расширенная структура папок с подпапками и заметками
  const folderStructure = {
    'daily-notes': {
      name: 'Daily Notes',
      type: 'folder',
      children: {
        '2024': {
          name: '2024',
          type: 'folder',
          children: {
            'january': {
              name: 'January',
              type: 'folder',
              children: {
                'note-1': { name: 'Meeting Notes Jan 15', type: 'note', id: 1, modified: '3 hours ago', preview: 'Team meeting discussion...' },
                'note-2': { name: 'Daily Reflection', type: 'note', id: 2, modified: '1 day ago', preview: 'Thoughts about today...' }
              }
            },
            'february': {
              name: 'February',
              type: 'folder',
              children: {
                'note-3': { name: 'Project Ideas', type: 'note', id: 3, modified: '2 days ago', preview: 'New project concepts...' }
              }
            }
          }
        },
        '2025': {
          name: '2025',
          type: 'folder',
          children: {
            'note-0': { name: 'Welcome', type: 'note', id: 0, modified: '2 minutes ago', preview: 'Welcome to Notes...' }
          }
        }
      }
    },
    'projects': {
      name: 'Projects',
      type: 'folder',
      children: {
        'web-app': {
          name: 'Web Application',
          type: 'folder',
          children: {
            'note-4': { name: 'Project Plan', type: 'note', id: 4, modified: '1 day ago', preview: 'Project roadmap and milestones...' },
            'note-5': { name: 'Tech Stack', type: 'note', id: 5, modified: '3 days ago', preview: 'Technology decisions...' }
          }
        },
        'mobile-app': {
          name: 'Mobile App',
          type: 'folder',
          children: {
            'note-6': { name: 'UI Design', type: 'note', id: 6, modified: '1 week ago', preview: 'Mobile interface concepts...' }
          }
        }
      }
    },
    'personal': {
      name: 'Personal',
      type: 'folder',
      children: {
        'note-7': { name: 'Travel Plans', type: 'note', id: 7, modified: '1 week ago', preview: 'Itinerary for upcoming trip...' },
        'note-8': { name: 'Shopping List', type: 'note', id: 8, modified: '2 weeks ago', preview: 'Items to buy...' }
      }
    },
    'archive': {
      name: 'Archive',
      type: 'folder',
      children: {
        'old-notes': {
          name: 'Old Notes',
          type: 'folder',
          children: {
            'note-9': { name: 'Research Notes', type: 'note', id: 9, modified: '1 month ago', preview: 'Research findings...' }
          }
        }
      }
    }
  };

  const [notes] = useState([
    { id: 0, title: 'Welcome', modified: '2 minutes ago', preview: 'Welcome to Notes...' },
    { id: 1, title: 'Meeting Notes Jan 15', modified: '3 hours ago', preview: 'Team meeting discussion...' },
    { id: 2, title: 'Daily Reflection', modified: '1 day ago', preview: 'Thoughts about today...' },
    { id: 3, title: 'Project Ideas', modified: '2 days ago', preview: 'New project concepts...' },
    { id: 4, title: 'Project Plan', modified: '1 day ago', preview: 'Project roadmap and milestones...' },
    { id: 5, title: 'Tech Stack', modified: '3 days ago', preview: 'Technology decisions...' },
    { id: 6, title: 'UI Design', modified: '1 week ago', preview: 'Mobile interface concepts...' },
    { id: 7, title: 'Travel Plans', modified: '1 week ago', preview: 'Itinerary for upcoming trip...' },
    { id: 8, title: 'Shopping List', modified: '2 weeks ago', preview: 'Items to buy...' },
    { id: 9, title: 'Research Notes', modified: '1 month ago', preview: 'Research findings...' }
  ]);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const selectFolder = (folderId: string) => {
    setSelectedFolder(selectedFolder === folderId ? null : folderId);
  };

  const renderFolderTree = (items: any, level: number = 0, parentPath: string = '') => {
    return Object.entries(items).map(([key, item]: [string, any]) => {
      const fullPath = parentPath ? `${parentPath}/${key}` : key;
      const isExpanded = expandedFolders.has(fullPath);
      const isSelected = selectedFolder === fullPath;
      
      if (item.type === 'folder') {
        const childrenCount = Object.keys(item.children).length;
        const notesInFolder = Object.values(item.children).filter((child: any) => child.type === 'note').length;
        
        return (
          <div key={fullPath}>
            <div
              className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer text-sm transition-colors ${
                isSelected ? 'bg-blue-600 bg-opacity-20' : 'hover:bg-ui-bg-secondary-light'
              }`}
              style={{ marginLeft: `${level * 12}px` }}
              onClick={() => {
                toggleFolder(fullPath);
                selectFolder(fullPath);
              }}
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
                <svg className="h-3 w-3 text-ui-text-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span>{item.name}</span>
              </div>
              <span className="text-xs text-ui-text-muted">{childrenCount}</span>
            </div>
            {isExpanded && (
              <div className="mt-1">
                {renderFolderTree(item.children, level + 1, fullPath)}
              </div>
            )}
          </div>
        );
      } else if (item.type === 'note') {
        return (
          <div
            key={fullPath}
            onClick={() => setSelectedNote(item.id)}
            className={`p-2 rounded cursor-pointer transition-colors ${
              selectedNote === item.id
                ? 'bg-blue-600 bg-opacity-20 border border-blue-500'
                : 'hover:bg-ui-bg-secondary-light'
            }`}
            style={{ marginLeft: `${(level + 1) * 12}px` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="h-3 w-3 text-ui-text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div className="font-medium text-xs">{item.name}</div>
            </div>
            <div className="text-xs text-ui-text-muted mb-1">{item.modified}</div>
            <div className="text-xs text-ui-text-muted truncate">{item.preview}</div>
          </div>
        );
      }
    });
  };

  // Получение заметок из выбранной папки
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
    ? getNotesFromFolder(selectedFolder).filter(note => 
        note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      setIsCreatingNote(false);
      setNewNoteTitle('');
    }
  };

  return (
    <div className="flex h-screen bg-ui-bg-primary text-ui-text-primary">
      <div className="w-80 bg-ui-bg-primary-light border-r border-ui-border-primary flex flex-col">
        <div className="p-4 border-b border-ui-border-primary">
          <div className="relative">
            <TextInput
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ui-bg-secondary-light text-ui-text-primary px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-ui-text-muted"
            />
            <svg className="absolute right-3 top-2.5 h-4 w-4 text-ui-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="p-4 border-b border-ui-border-primary">
          {!isCreatingNote ? (
            <button
              onClick={() => setIsCreatingNote(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-slate-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Note
            </button>
          ) : (
            <div className="space-y-2">
              <TextInput
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full bg-ui-bg-secondary-light text-ui-text-primary px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNote}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-ui-text-primary px-3 py-1.5 rounded text-xs font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => {setIsCreatingNote(false); setNewNoteTitle('');}}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-ui-text-primary px-3 py-1.5 rounded text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-b border-ui-border-primary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-ui-text-muted uppercase tracking-wider">Folders</h3>
            {selectedFolder && (
              <button
                onClick={() => setSelectedFolder(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Show All
              </button>
            )}
          </div>
          <div className="space-y-1">
            {renderFolderTree(folderStructure)}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-ui-text-muted uppercase tracking-wider mb-3">
              {selectedFolder ? `Notes in ${selectedFolder.split('/').pop()}` : 'All Notes'}
            </h3>
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote === note.id
                      ? 'bg-blue-600 bg-opacity-20 border border-blue-500'
                      : 'hover:bg-ui-bg-secondary-light'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{note.title || note.name}</div>
                  <div className="text-xs text-ui-text-muted mb-2">{note.modified}</div>
                  <div className="text-xs text-ui-text-muted truncate">{note.preview}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 bg-ui-bg-primary-light border-b border-ui-border-primary flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{notes[selectedNote]?.title || 'Untitled'}</h1>
            <div className="text-xs text-ui-text-muted">
              Last modified: {notes[selectedNote]?.modified}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-ui-bg-secondary-light rounded-md p-1">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'editor' ? 'bg-blue-600 text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
                }`}
              >
                Split
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
                  className="w-full h-full bg-transparent text-ui-text-primary resize-none focus:outline-none font-mono text-sm leading-relaxed placeholder-ui-text-primary"
                  placeholder="Start writing your note..."
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                />
              </div>
            </div>
          )}
          
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'flex-1'} p-6`}>
              <ScrollArea className="h-full">
                <div 
                  className="prose prose-invert max-w-none text-ui-text-primary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parsedContent }}
                />
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="h-8 bg-ui-bg-secondary border-t border-ui-border-primary flex items-center justify-between px-4 text-xs text-ui-text-muted">
          <div className="flex items-center gap-4">
            <span>{noteContent.length} characters</span>
            <span>{noteContent.split('\n').length} lines</span>
            <span>{noteContent.split(' ').filter(word => word.length > 0).length} words</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Markdown</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Saved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotesView };