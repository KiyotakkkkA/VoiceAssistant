import React, { memo } from 'react';
import { ScrollArea } from '../../atoms';
import { NoteItem } from '../../../types/Global';

interface NotesEditorProps {
  currentNote: NoteItem | null;
  noteContent: string;
  viewMode: string;
  unsavedChanges: boolean;
  parsedContent: string;
  onContentChange: (content: string) => void;
  onViewModeChange: (mode: string) => void;
  onSave: () => void;
}

const NotesEditor: React.FC<NotesEditorProps> = memo(({
  currentNote,
  noteContent,
  viewMode,
  unsavedChanges,
  parsedContent,
  onContentChange,
  onViewModeChange,
  onSave
}) => {
  return (
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
            onClick={onSave}
            className="px-3 py-1.5 bg-widget-accent-b hover:bg-widget-accent-b/80 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Сохранить (Ctrl+S)
          </button>
          <div className="flex bg-ui-bg-secondary-light rounded-md p-1">
            <button
              onClick={() => onViewModeChange('editor')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'editor' ? 'bg-widget-accent-a text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
              }`}
            >
              Изменить
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'preview' ? 'bg-widget-accent-a text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
              }`}
            >
              Просмотр
            </button>
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'split' ? 'bg-widget-accent-a text-white' : 'text-ui-text-muted hover:text-ui-text-primary'
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
                onChange={(e) => onContentChange(e.target.value)}
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
  );
});

export { NotesEditor };