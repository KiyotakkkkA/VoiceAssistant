import React, { useState } from 'react';

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

interface AiMessageProps {
  userText: string;
  aiResponse: string | AIResponse;
  modelName: string;
  timestamp?: Date;
  isLatest?: boolean;
}

const parseMarkdown = (text: string): string => {
  const parseTable = (tableText: string): string => {
    const lines = tableText.trim().split('\n');
    if (lines.length < 3) return tableText;
    
    const headerLine = lines[0];
    const separatorLine = lines[1];
    const dataLines = lines.slice(2);
    
    if (!separatorLine.match(/^\|?[\s\-\|:]+\|?$/)) {
      return tableText;
    }
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    
    const alignments = separatorLine.split('|').map(sep => {
      const trimmed = sep.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    }).filter((_, i) => i < headers.length);
    
    let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-ui-border-primary rounded-lg">';
    
    tableHtml += '<thead class="bg-ui-bg-secondary/50"><tr>';
    headers.forEach((header, i) => {
      const align = alignments[i] || 'left';
      tableHtml += `<th class="border border-ui-border-primary px-3 py-2 text-${align} font-semibold text-sm text-ui-text-primary">${header}</th>`;
    });
    tableHtml += '</tr></thead>';
    
    tableHtml += '<tbody>';
    dataLines.forEach((line, rowIndex) => {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length > 0) {
        const rowClass = rowIndex % 2 === 0 ? 'bg-ui-bg-primary' : 'bg-ui-bg-secondary/20';
        tableHtml += `<tr class="${rowClass} hover:bg-ui-bg-secondary/40 transition-colors">`;
        cells.forEach((cell, i) => {
          const align = alignments[i] || 'left';
          tableHtml += `<td class="border border-ui-border-primary px-3 py-2 text-${align} text-sm text-ui-text-primary">${cell}</td>`;
        });
        for (let i = cells.length; i < headers.length; i++) {
          const align = alignments[i] || 'left';
          tableHtml += `<td class="border border-ui-border-primary px-3 py-2 text-${align} text-sm text-ui-text-primary"></td>`;
        }
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table></div>';
    
    return tableHtml;
  };
  
  return text
    .replace(/((?:\|.+\|[\r\n]+)+\|[\s\-\|:]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/gm, (match) => {
      return parseTable(match);
    })
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mb-2 mt-4 first:mt-0">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mb-2 mt-4 first:mt-0">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-3 mt-4 first:mt-0">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/__(.*?)__/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(/_(.*?)_/gim, '<em class="italic">$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-ui-bg-secondary p-3 rounded-lg border border-ui-border-primary/50 overflow-x-auto my-3"><code class="text-sm font-mono whitespace-pre">$2</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-ui-accent hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\* (.+)$/gim, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/^- (.+)$/gim, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/^\d+\. (.+)$/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
    .replace(/\n\n/gim, '</p><p class="mb-3">')
    .replace(/\n/gim, '<br />');
};

const ThinkingBlock: React.FC<{ thinking: string; isExpanded: boolean; onToggle: () => void }> = ({ 
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
          <svg className="w-4 h-4 text-ui-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm font-medium text-ui-text-secondary">Размышления модели</span>
        </div>
        <svg 
          className={`w-4 h-4 text-ui-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="bg-ui-bg-secondary/30 rounded p-3 text-sm text-ui-text-primary italic leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(thinking) }} />
          </div>
        </div>
      )}
    </div>
  );
};

const ToolCallsBlock: React.FC<{ toolCalls: ToolCall[]; isExpanded: boolean; onToggle: () => void }> = ({ 
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
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-ui-text-secondary">Используемые инструменты</span>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
            {toolCalls.length}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-ui-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
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
                <span className="font-mono text-sm font-medium text-ui-text-primary">{tool.name}</span>
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
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [finalThinkingExpanded, setFinalThinkingExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getModelIcon = (model: string) => {
    if (model.includes('gpt') || model.includes('openai')) {
      return '🤖';
    } else if (model.includes('claude')) {
      return '🧠';
    } else if (model.includes('gemini')) {
      return '💎';
    }
    return '🤖';
  };

  const getModelColor = (model: string) => {
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
              isExpanded={thinkingExpanded}
              onToggle={() => setThinkingExpanded(!thinkingExpanded)}
            />
          )}

          {response?.tools_calling_stage && response.tools_calling_stage.length > 0 && (
            <ToolCallsBlock
              toolCalls={response.tools_calling_stage}
              isExpanded={toolsExpanded}
              onToggle={() => setToolsExpanded(!toolsExpanded)}
            />
          )}

          {response?.final_stage?.thinking && (
            <ThinkingBlock
              thinking={response.final_stage.thinking}
              isExpanded={finalThinkingExpanded}
              onToggle={() => setFinalThinkingExpanded(!finalThinkingExpanded)}
            />
          )}

          {mainContent && (
            <div className="text-sm text-ui-text-primary leading-relaxed prose prose-sm max-w-none bg-ui-bg-secondary/10 rounded-lg p-3 border border-ui-border-primary/30">
              <div dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-3">${parseMarkdown(mainContent)}</p>` 
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