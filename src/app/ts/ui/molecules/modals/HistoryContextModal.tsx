import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import AIMessagesStore from '../../../store/AIMessagesStore';
import { RangeInput } from '../../atoms/input';

interface HistoryContextModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HistoryContextModal: React.FC<HistoryContextModalProps> = observer(({ 
  isVisible, 
  onClose 
}) => {
  const [contextLimit, setContextLimit] = useState(10);

  if (!isVisible) return null;

  const activeDialog = AIMessagesStore.getActiveDialog();
  const contextMessages = AIMessagesStore.getContextMessages();
  const isHistoryEnabled = AIMessagesStore.getHistoryContext();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-ui-bg-primary border border-ui-border-primary rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ui-text-primary">
            Настройки контекста истории
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-ui-accent/10 text-ui-text-muted hover:text-ui-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-ui-bg-secondary/30">
            <div>
              <h4 className="font-medium text-ui-text-primary">
                Использовать контекст истории
              </h4>
              <p className="text-sm text-ui-text-muted">
                AI будет учитывать предыдущие сообщения в диалоге
              </p>
            </div>
            <button
              onClick={() => AIMessagesStore.toggleHistoryContext()}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isHistoryEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isHistoryEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {activeDialog && (
            <div className="p-3 rounded-lg bg-ui-bg-secondary/20 border border-ui-border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isHistoryEnabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-ui-text-primary">
                  Текущий диалог
                </span>
              </div>
              <div className="space-y-1 text-xs text-ui-text-muted">
                <p>Всего сообщений: {activeDialog.messages.length}</p>
                <p>В контексте: {isHistoryEnabled ? contextMessages.length : 0}</p>
                <p>
                  Статус: {isHistoryEnabled ? 
                    <span className="text-green-400">Контекст включен</span> : 
                    <span className="text-gray-400">Контекст отключен</span>
                  }
                </p>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-ui-bg-secondary/20 border border-ui-border-primary/30">
            <h4 className="font-medium text-ui-text-primary mb-2">
              Лимит контекстных сообщений
            </h4>
            <RangeInput
              min={1}
              max={20}
              value={contextLimit}
              onChange={setContextLimit}
            />
            <p className="text-xs text-ui-text-muted mt-1">
              Максимальное количество последних сообщений для контекста
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-ui-bg-secondary text-ui-text-primary hover:bg-ui-bg-secondary/80 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
});

export { HistoryContextModal };
