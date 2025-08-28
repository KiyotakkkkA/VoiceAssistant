import React, { useState, useRef, useEffect } from 'react';
import { AiMessage } from '../atoms/feedback';
import { observer } from 'mobx-react-lite';
import { IconFile } from '../atoms/icons';
import SettingsStore from '../../store/SettingsStore';
import { useDragResize } from '../../composables';

interface ToolCall {
  name: string;
  args: any;
  response: any;
}

interface AIResponse {
  initial_stage?: {
    thinking?: string;
    content?: string;
  };
  tools_calling_stage?: ToolCall[];
  final_stage?: {
    thinking?: string;
    content?: string;
  };
}

interface AiHistoryMsg {
  model_name: string;
  text: string | AIResponse;
  timestamp?: Date;
}

interface AiHistoryPanelProps {
  messages: AiHistoryMsg[];
  isVisible: boolean;
  onToggle: () => void;
  isDropdownVisible?: boolean;
}

const AiHistoryPanel: React.FC<AiHistoryPanelProps> = observer(({ 
  messages, 
  isVisible, 
  onToggle,
  isDropdownVisible = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [panelWidth, setPanelWidth] = useState(960);
  const [dragging, setDragging] = useState(false);
  
  const { onDragStart, didDragRef } = useDragResize(panelWidth, 400, 0.9, 'horizontal');

  useEffect(() => {
    if (isVisible && messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, isVisible]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isVisible) return;
    onDragStart(e, setPanelWidth, setDragging);
  };

  const clearHistory = () => {
    SettingsStore.clearAiHistory();
  };

  const getToolsCount = (response: string | AIResponse): number => {
    if (typeof response === 'string') {
      return 0;
    }
    return response.tools_calling_stage?.length || 0;
  };

  const hasThinking = (response: string | AIResponse): boolean => {
    if (typeof response === 'string') {
      return false;
    }
    return !!(response.initial_stage?.thinking || response.final_stage?.thinking);
  };

  const messageHistory = messages.reduce((acc: Array<{
    userText: string, 
    aiResponse: string | AIResponse, 
    modelName: string, 
    timestamp: Date,
    toolsUsed: number,
    hasThinking: boolean
  }>, msg, index) => {
    if (index % 2 === 0) {
      const userText = msg.text as string;
      const nextMsg = messages[index + 1];
      if (nextMsg) {
        acc.push({
          userText,
          aiResponse: nextMsg.text,
          modelName: nextMsg.model_name,
          timestamp: msg.timestamp || new Date(),
          toolsUsed: getToolsCount(nextMsg.text),
          hasThinking: hasThinking(nextMsg.text)
        });
      }
    }
    return acc;
  }, []);

  const totalDialogs = messageHistory.length;

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
          messages.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-100'
        }`} />
        <span className="text-sm font-medium">Беседы</span>
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
          className="h-full bg-ui-bg-primary/95 backdrop-blur-lg border-l border-ui-border-primary shadow-2xl flex flex-col relative"
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

          <div className="p-4 border-b border-ui-border-primary">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-ui-text-primary">Беседы</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ui-text-muted">
                  {totalDialogs} диалог{totalDialogs !== 1 ? 'ов' : ''}
                </span>
                {dragging && (
                  <span className="text-xs text-ui-accent font-mono">
                    {Math.round(panelWidth)}px
                  </span>
                )}
                <button
                  onClick={clearHistory}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Очистить историю"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-ui-text-muted">Последние диалоги с внешними AI моделями</p>
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
                <h4 className="text-lg font-medium text-ui-text-primary mb-2">Пока пусто</h4>
                <p className="text-sm text-ui-text-muted max-w-48">
                  История диалогов с AI появится здесь после первого запроса
                </p>
              </div>
            ) : (
              messageHistory.map((conversation, index) => (
                <AiMessage
                  key={index}
                  userText={conversation.userText}
                  aiResponse={conversation.aiResponse}
                  modelName={conversation.modelName}
                  timestamp={conversation.timestamp}
                  isLatest={index === messageHistory.length - 1}
                />
              ))
            )}
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

export { AiHistoryPanel };