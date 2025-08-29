import React from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '../../../types/Global';
import { IconPen, IconCheck, IconX, IconTrash } from '../../atoms/icons';

import AIMessagesStore from '../../../store/AIMessagesStore';

interface AiMsgPreviewCardProps {
  dialog: Dialog;
  editingDialogId: string | null;
  editingTitle: string;
  onDialogSelect: (dialogId: string) => void;
  onEditStart: (dialog: Dialog, e: React.MouseEvent) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDeleteDialog: (dialogId: string, e: React.MouseEvent) => void;
  onEditTitleChange: (value: string) => void;
  formatDate: (date: Date) => string;
  getMessagePreview: (dialog: Dialog) => string;
}

const AiMsgPreviewCard: React.FC<AiMsgPreviewCardProps> = observer(({ 
  dialog, 
  editingDialogId,
  editingTitle,
  onDialogSelect,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDeleteDialog,
  onEditTitleChange,
  formatDate,
  getMessagePreview
}) => {
  return (
    <div
      key={dialog.id}
      onClick={() => onDialogSelect(dialog.id)}
      className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        dialog.is_active
          ? 'bg-ui-bg-secondary-light border border-ui-border-primary'
          : 'hover:bg-ui-bg-primary/50 border border-transparent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {editingDialogId === dialog.id ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-ui-bg-primary border border-ui-border-primary rounded text-ui-text-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onEditSave();
                  if (e.key === 'Escape') onEditCancel();
                }}
              />
              <button
                onClick={onEditSave}
                className="p-1 rounded text-green-400 hover:bg-green-400/20"
              >
                <IconCheck size={12} />
              </button>
              <button
                onClick={onEditCancel}
                className="p-1 rounded text-red-400 hover:bg-red-400/20"
              >
                <IconX size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`text-sm font-medium truncate ${
                dialog.is_active ? 'text-ui-accent' : 'text-ui-text-primary'
              }`}>
                {dialog.title}
              </h4>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={(e) => onEditStart(dialog, e)}
                  className="p-1 rounded text-ui-text-muted hover:text-ui-text-primary hover:bg-ui-bg-primary/50"
                  title="Переименовать"
                >
                  <IconPen size={12} />
                </button>
                {AIMessagesStore.data.dialogs.length > 1 && (
                  <button
                    onClick={(e) => onDeleteDialog(dialog.id, e)}
                    className="p-1 rounded text-ui-text-muted hover:text-red-400 hover:bg-red-400/20"
                    title="Удалить диалог"
                  >
                    <IconTrash size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
          
          <p className="text-xs text-ui-text-muted truncate mb-2">
            {getMessagePreview(dialog)}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-ui-text-muted">
              {Math.floor(dialog.messages.length / 2)} сообщени{Math.floor(dialog.messages.length / 2) !== 1 ? 'й' : 'е'}
            </span>
            <span className="text-ui-text-muted">
              {formatDate(dialog.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export { AiMsgPreviewCard };
