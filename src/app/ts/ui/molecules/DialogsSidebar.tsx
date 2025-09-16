import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '../../types/Global';
import { IconPlus, IconMessage } from '../atoms/icons';
import { AiMsgPreviewCard } from './widgets/cards';
import { useSocketActions } from '../../composables/useSocketActions';

import AIMessagesStore from '../../store/AIMessagesStore';

interface DialogsSidebarProps {
  isVisible: boolean;
  onDialogSelect: (dialogId: string) => void;
}

const DialogsSidebar: React.FC<DialogsSidebarProps> = observer(({ 
  isVisible, 
  onDialogSelect 
}) => {
  const { emitActiveDialog } = useSocketActions();
  const [editingDialogId, setEditingDialogId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateDialog = () => {
    const newDialogId = AIMessagesStore.createDialog();
    onDialogSelect(newDialogId);
    emitActiveDialog(newDialogId);
  };

  const handleEditStart = (dialog: Dialog, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDialogId(dialog.id);
    setEditingTitle(dialog.title);
  };

  const handleEditSave = () => {
    if (editingDialogId && editingTitle.trim()) {
      AIMessagesStore.updateDialogTitle(editingDialogId, editingTitle.trim());
    }
    setEditingDialogId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingDialogId(null);
    setEditingTitle('');
  };

  const handleDeleteDialog = (dialogId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (AIMessagesStore.data.dialogs.length > 1) {
      AIMessagesStore.deleteDialog(dialogId);
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Сегодня';
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  if (!isVisible) return null;

  const sortedDialogs = [...AIMessagesStore.data.dialogs].sort((a, b) => 
    b.updated_at.getTime() - a.updated_at.getTime()
  );

  return (
    <div className="w-80 h-full bg-ui-bg-secondary/95 backdrop-blur-lg border-r border-ui-border-primary flex flex-col">
      <div className="p-4 border-b border-ui-border-primary">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-ui-text-primary">Диалоги</h3>
          <button
            onClick={handleCreateDialog}
            className="p-2 rounded-lg bg-ui-accent/10 text-ui-accent hover:bg-ui-accent/20 transition-colors"
            title="Создать новый диалог"
          >
            <IconPlus size={16} />
          </button>
        </div>
        <p className="text-xs text-ui-text-muted">
          {AIMessagesStore.data.dialogs.length} диалог{AIMessagesStore.data.dialogs.length !== 1 ? 'ов' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedDialogs.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mx-auto mb-3">
              <IconMessage size={24} />
            </div>
            <p className="text-sm text-ui-text-muted">Нет диалогов</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedDialogs.map((dialog) => (
              <AiMsgPreviewCard
                key={dialog.id}
                dialog={dialog}
                editingDialogId={editingDialogId}
                editingTitle={editingTitle}
                onDialogSelect={(id) => { onDialogSelect(id); emitActiveDialog(id); }}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onDeleteDialog={handleDeleteDialog}
                onEditTitleChange={setEditingTitle}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export { DialogsSidebar };
