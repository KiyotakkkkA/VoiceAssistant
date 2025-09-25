import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import StreamingAIStore from '../../../store/StreamingAIStore';

interface StreamingAIMessageCardProps {
  userText: string;
  modelName: string;
  timestamp?: Date;
}

const StreamingAIMessageCard: React.FC<StreamingAIMessageCardProps> = observer(({ 
  userText, 
  modelName, 
  timestamp 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [StreamingAIStore.currentSession?.content, StreamingAIStore.currentSession?.thinking]);

  const streamingContent = StreamingAIStore.getCurrentStreamingContent();
  const isStreaming = StreamingAIStore.isStreaming();

  if (!streamingContent && !isStreaming) return null;

  const getModelBadgeStyle = (model: string): string => {
    const lowerModel = model.toLowerCase();
    if (lowerModel.includes('gpt') || lowerModel.includes('openai')) {
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    } else if (lowerModel.includes('claude')) {
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    } else if (lowerModel.includes('gemini')) {
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
    return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  };

  return (
    <div className="group relative p-4 rounded-xl border border-ui-border-primary bg-gradient-to-br from-ui-bg-secondary/30 to-ui-bg-secondary/10 transition-all duration-300 hover:border-ui-border-primary">
      <div className="mb-4 p-3 rounded-lg bg-ui-accent/10 border border-ui-border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-ui-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-medium text-ui-accent">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-ui-text-primary leading-relaxed">{userText}</p>
            {timestamp && (
              <p className="text-xs text-ui-text-muted mt-1">
                {timestamp.toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="text-xs font-medium text-purple-400">AI</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getModelBadgeStyle(modelName)}`}>
            {modelName}
          </span>
        </div>
        
        {isStreaming && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Генерирует ответ...</span>
          </div>
        )}
      </div>

      <div 
        ref={contentRef}
        className="max-h-96 overflow-y-auto custom-scrollbar"
      >
        {streamingContent?.thinking && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-yellow-400 uppercase tracking-wide">
                Размышления
              </span>
            </div>
            <div className="text-sm text-ui-text-secondary leading-relaxed whitespace-pre-wrap">
              {streamingContent.thinking}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse"></span>
              )}
            </div>
          </div>
        )}

        {streamingContent?.content && (
          <div className="p-3 rounded-lg bg-ui-bg-primary/50">
            <div className="text-sm text-ui-text-primary leading-relaxed whitespace-pre-wrap">
              {streamingContent.content}
              {isStreaming && !streamingContent.thinking && (
                <span className="inline-block w-2 h-4 bg-ui-accent ml-1 animate-pulse"></span>
              )}
            </div>
          </div>
        )}

        {isStreaming && !streamingContent?.content && !streamingContent?.thinking && (
          <div className="p-3 rounded-lg bg-ui-bg-primary/50">
            <div className="flex items-center gap-2 text-ui-text-muted">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-ui-accent rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-ui-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-ui-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-xs">Ожидание ответа...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export { StreamingAIMessageCard };
