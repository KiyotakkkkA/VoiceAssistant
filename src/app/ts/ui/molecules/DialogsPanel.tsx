import React, { useState, useRef, useEffect } from 'react';
import { AiMessageCard } from './widgets/cards';
import { StreamingAIMessage } from './widgets/ai';
import { observer } from 'mobx-react-lite';
import { IconFile, IconTrash, IconMessage } from '../atoms/icons';
import { useDragResize } from '../../composables';
import { DialogsSidebar } from './DialogsSidebar';
import { Dialog } from '../../types/Global';

import AIMessagesStore from '../../store/AIMessagesStore';
import StreamingAIStore from '../../store/StreamingAIStore';

interface DialogsPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  isDropdownVisible?: boolean;
}

const DialogsPanel: React.FC<DialogsPanelProps> = observer(({ 
  isVisible, 
  onToggle,
  isDropdownVisible = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(960);
  const [dragging, setDragging] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const { onDragStart, didDragRef } = useDragResize(panelWidth, 400, 0.9, 'horizontal');

  useEffect(() => {
    if (isVisible && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [isVisible]);

  useEffect(() => {
    const activeDialog = AIMessagesStore.getActiveDialog();
    if (isVisible && activeDialog && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      window.safeTimers.setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [AIMessagesStore.getActiveDialog()?.messages.length, isVisible]);

  useEffect(() => {
    if (isVisible && StreamingAIStore.isStreaming() && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [StreamingAIStore.currentSession?.content, StreamingAIStore.currentSession?.thinking, isVisible]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isVisible) return;
    onDragStart(e, setPanelWidth, setDragging);
  };

  const handleDialogSelect = (dialogId: string) => {
    AIMessagesStore.setActiveDialog(dialogId);
  };

  const clearActiveDialog = () => {
    AIMessagesStore.clearActiveDialog();
  };

  const activeDialog = AIMessagesStore.getActiveDialog();
  const totalDialogs = AIMessagesStore.data.dialogs.length;

  const convertDialogToMessages = (dialog: Dialog | null) => {
    if (!dialog) return [];
    
    const messageHistory: Array<{
      userText: string,
      aiResponse: string | any,
      modelName: string,
      timestamp: Date,
      toolsUsed: number,
      hasThinking: boolean
    }> = [];

    for (let i = 0; i < dialog.messages.length; i += 2) {
      const userMessage = dialog.messages[i];
      const aiMessage = dialog.messages[i + 1];

      if (userMessage && userMessage.role === 'user') {
        const userText = typeof userMessage.content === 'string' ? userMessage.content : 'Сложный запрос';
        
        if (aiMessage && aiMessage.role === 'assistant') {
          messageHistory.push({
            userText,
            aiResponse: aiMessage.content,
            modelName: aiMessage.model_name || 'Unknown Model',
            timestamp: userMessage.timestamp,
            toolsUsed: getToolsCount(aiMessage.content),
            hasThinking: hasThinking(aiMessage.content)
          });
        } else {

          messageHistory.push({
            userText,
            aiResponse: '',
            modelName: 'Ожидание ответа...',
            timestamp: userMessage.timestamp,
            toolsUsed: 0,
            hasThinking: false
          });
        }
      }
    }

    return messageHistory;
  };

  const getToolsCount = (response: string | any): number => {
    if (typeof response === 'string') {
      return 0;
    }
    return response.tools_calling_stage?.length || 0;
  };

  const hasThinking = (response: string | any): boolean => {
    if (typeof response === 'string') {
      return false;
    }
    return !!(response.initial_stage?.thinking || response.final_stage?.thinking);
  };

  const messageHistory = convertDialogToMessages(activeDialog);

  return (
    <>
      <button
        onClick={onToggle}
        className={`fixed top-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all duration-300 ${
          isDropdownVisible ? 'left-[16rem] top-[6rem]' : 'left-[16rem] top-[3rem]'
        } ${
          isVisible 
            ? 'bg-ui-bg-secondary-light/80 border-ui-border-primary text-ui-accent' 
            : 'border-ui-border-primary text-ui-text-muted hover:border-ui-border-primary hover:text-ui-text-primary'
        }`}
      >
        <div className={`w-2 h-2 rounded-full transition-colors ${
          totalDialogs > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-100'
        }`} />
        <span className="text-sm font-medium">Диалоги</span>
        <span className="text-xs opacity-70">({totalDialogs})</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className={`fixed top-0 right-0 h-full z-20 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div 
          className="h-full bg-ui-bg-primary/95 backdrop-blur-lg border-l border-ui-border-primary shadow-2xl flex relative"
          style={{ 
            width: panelWidth,
            transition: dragging ? 'none' : 'width 0.2s ease'
          }}
        >
          {isVisible && (
            <div
              onMouseDown={handleDragStart}
              className={`absolute top-0 left-0 bottom-0 w-2 -translate-x-full cursor-col-resize z-30 ${
                dragging ? 'bg-draghandle-bg-active/20' : 'bg-transparent hover:bg-draghandle-bg-hover/10'
              }`}
            >
              <div className={`h-full w-px bg-gradient-to-b from-widget-accent-a/30 via-widget-accent-b/30 to-widget-accent-a/30 translate-x-[7px] pointer-events-none ${
                dragging ? 'animate-pulse' : ''
              }`} />
            </div>
          )}

          {sidebarVisible && (
            <DialogsSidebar 
              isVisible={sidebarVisible}
              onDialogSelect={handleDialogSelect}
            />
          )}

          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-ui-border-primary">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    className="p-1.5 rounded-lg bg-ui-accent/10 text-ui-accent hover:bg-ui-accent/20 transition-colors"
                    title={sidebarVisible ? 'Скрыть панель диалогов' : 'Показать панель диалогов'}
                  >
                    <IconMessage size={16} />
                  </button>
                  <h3 className="text-lg font-semibold text-ui-text-primary">
                    {activeDialog?.title || 'Диалог'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {dragging && (
                    <span className="text-xs text-ui-accent font-mono">
                      {Math.round(panelWidth)}px
                    </span>
                  )}
                  <button
                    onClick={clearActiveDialog}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Очистить диалог"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
              {activeDialog && (
                <p className="text-xs text-ui-text-muted">
                  {activeDialog.messages.length} сообщени{activeDialog.messages.length !== 1 ? 'й' : 'е'} • 
                  Создан {activeDialog.created_at.toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messageHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4">
                    <IconFile className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-medium text-ui-text-primary mb-2">Начните диалог</h4>
                  <p className="text-sm text-ui-text-muted max-w-48">
                    Этот диалог пуст. Отправьте первое сообщение AI, чтобы начать беседу.
                  </p>
                </div>
              ) : (
                <>
                  {messageHistory.map((conversation, index) => (
                    <AiMessageCard
                      key={index}
                      userText={conversation.userText}
                      aiResponse={conversation.aiResponse}
                      modelName={conversation.modelName}
                      timestamp={conversation.timestamp}
                      isLatest={index === messageHistory.length - 1}
                    />
                  ))}
                  
                  {StreamingAIStore.isStreaming() && (
                    <StreamingAIMessage
                      userText={StreamingAIStore.currentSession?.originalText || ''}
                      modelName={StreamingAIStore.currentSession?.modelName || 'Unknown'}
                      timestamp={StreamingAIStore.currentSession?.startTime}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 transition-opacity duration-300"
          onClick={(e) => {
            if (!didDragRef.current) {
              onToggle();
            }
          }}
        />
      )}
    </>
  );
});

export { DialogsPanel };
