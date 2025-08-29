import React from 'react';
import { useMarkdown, useTimeFormatter, useModuleHelpers, useExpandable } from '../../../composables';
import { AIResponse, ToolCall } from '../../../types/Global';
import { IconIdea, IconSettings } from '../icons';

interface AiMessageProps {
  userText: string;
  aiResponse: string | AIResponse;
  modelName: string;
  timestamp?: Date;
  isLatest?: boolean;
}

const ThinkingBlock: React.FC<{ thinking: string; isExpanded: boolean; onToggle: () => void, thinkingTime: number }> = ({ 
  thinkingTime,
  thinking, 
  isExpanded, 
  onToggle 
}) => {
  if (!thinking || thinking.trim() === '') return null;

  return (
    <div className="mb-4 border border-ui-border-primary/50 rounded-lg overflow-hidden bg-ui-bg-secondary/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-ui-bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <IconIdea size={18} className='text-yellow-500'/>
          <span className="text-sm font-medium text-ui-text-secondary">Размышления модели</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ui-text-muted">{thinkingTime} сек.</span>
          <svg 
            className={`w-4 h-4 text-ui-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="bg-ui-bg-secondary/30 rounded p-3 text-sm text-ui-text-primary italic leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: useMarkdown(thinking || '') }} />
          </div>
        </div>
      )}
    </div>
  );
};

const ToolCallsBlock: React.FC<{ toolCalls: ToolCall[]; isExpanded: boolean; onToggle: () => void, toolsTime: number }> = ({
  toolsTime, 
  toolCalls, 
  isExpanded, 
  onToggle 
}) => {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mb-4 border border-ui-border-primary/50 rounded-lg overflow-hidden bg-blue-50/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-ui-bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <IconSettings size={18} className='text-blue-500'/>
          <span className="text-sm font-medium text-ui-text-secondary">Используемые инструменты</span>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
            {toolCalls.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ui-text-muted">{toolsTime} сек.</span>
          <svg
            className={`w-4 h-4 text-ui-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {toolCalls.map((tool, index) => (
            <div key={index} className="bg-ui-bg-secondary/30 rounded-lg p-3 border border-ui-border-primary/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <div className="flex justify-between w-full">
                  <span className="font-mono text-sm font-medium text-ui-text-primary">{tool.name}</span>
                  <span className="font-mono text-xs font-medium text-ui-text-muted">{tool.execution_time} сек.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AiMessage: React.FC<AiMessageProps> = ({ 
  userText, 
  aiResponse, 
  modelName, 
  timestamp = new Date(), 
  isLatest = false 
}) => {
  const thinkingExpandable = useExpandable(false);
  const toolsExpandable = useExpandable(false);
  const finalThinkingExpandable = useExpandable(false);
  
  const { formatTime } = useTimeFormatter();
  const { getModelIcon } = useModuleHelpers();  const getModelColor = (model: string) => {
    if (model.includes('gpt') || model.includes('openai')) {
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    } else if (model.includes('claude')) {
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    } else if (model.includes('gemini')) {
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const isStructuredResponse = typeof aiResponse === 'object' && aiResponse !== null;
  const response = isStructuredResponse ? aiResponse as AIResponse : null;
  const simpleResponse = !isStructuredResponse ? aiResponse as string : null;

  let mainContent = '';
  if (response) {
    mainContent = response.final_stage?.content || response.initial_stage?.content || '';
  } else {
    mainContent = simpleResponse || '';
  }

  return (
    <div className={`group relative p-4 rounded-xl border transition-all duration-300 ${
      isLatest 
        ? 'border-ui-border-primary bg-gradient-to-br from-ui-accent/5 to-ui-accent/10 shadow-lg' 
        : 'border-ui-border-primary bg-gradient-to-br from-ui-bg-secondary/30 to-ui-bg-secondary/10 hover:border-ui-border-primary'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getModelColor(modelName)}`}>
            <span>{getModelIcon(modelName)}</span>
            <span className="font-mono">{modelName.replace(/^[^/]+\//, '')}</span>
          </div>
          {isLatest && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-ui-accent/10 text-ui-accent text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-ui-accent animate-pulse" />
              <span>Последнее</span>
            </div>
          )}
        </div>
        <div className="text-xs text-ui-text-muted font-mono">
          {formatTime(timestamp)}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-ui-accent/20 flex items-center justify-center">
            <span className="text-xs">👤</span>
          </div>
          <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">Запрос</span>
        </div>
        <div className="pl-8 text-sm text-ui-text-primary bg-ui-bg-secondary/30 rounded-lg p-3 border border-ui-border-primary/50">
          {userText}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getModelColor(modelName).split(' ')[1]}`}>
            <span className="text-xs">{getModelIcon(modelName)}</span>
          </div>
          <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">Ответ</span>
        </div>
        
        <div className="pl-8">
          {response?.initial_stage?.thinking && (
            <ThinkingBlock
              thinking={response.initial_stage.thinking}
              isExpanded={thinkingExpandable.isExpanded}
              onToggle={thinkingExpandable.toggle}
              thinkingTime={response.timing?.thinking_time || 0}
            />
          )}

          {response?.tools_calling_stage && response.tools_calling_stage.length > 0 && (
            <ToolCallsBlock
              toolCalls={response.tools_calling_stage}
              isExpanded={toolsExpandable.isExpanded}
              onToggle={toolsExpandable.toggle}
              toolsTime={response.timing?.tool_calls_time || 0}
            />
          )}

          {response?.final_stage?.thinking && (
            <ThinkingBlock
              thinking={response.final_stage.thinking}
              isExpanded={finalThinkingExpandable.isExpanded}
              onToggle={finalThinkingExpandable.toggle}
              thinkingTime={response.timing?.thinking_time || 0}
            />
          )}

          {mainContent && (
            <div className="text-sm text-ui-text-primary leading-relaxed prose prose-sm max-w-none bg-ui-bg-secondary/10 rounded-lg p-3 border border-ui-border-primary/30">
              <div dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-3">${useMarkdown(mainContent || '')}</p>` 
              }} />
            </div>
          )}
        </div>
      </div>

      {isLatest && (
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-ui-accent/40 to-transparent" />
      )}

      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-ui-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export { AiMessage };